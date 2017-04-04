---
title: 'Fiddling with ASP.NET Core and F# with Suave'
tags:
  - .net
  - fsharp
author: shane
categories:
  - All Posts
  - Programming
description: >-
  Suave is a possible replacement for the ASP.NET stack, but with some help, the
  two can be used together to build composable F# web applications.
date: 2017-01-22 23:00:25
---

ASP.NET is a great framework for building web applications. It's tried and trusted, fully extensible, has a great community, and thanks to .NET Core, supported across Linux, MacOS, and Windows. Being built with .NET, we have the wise option of building our application with F#, but without intervention, we'd be stuck with using the object-oriented C# types that are throughout ASP.NET.

## The Setup

To overcome this, we'll leverage [Suave](https://suave.io/), which can be a full replacement for ASP.NET, and [`Suave.AspNetCore`](https://github.com/dustinmoris/Suave.AspNetCore) to tie the two together. Let's start with a generated project thanks to [`yo aspnet`](https://github.com/OmniSharp/generator-aspnet) and the `Web API Application (F#)` template it provides, stripping out some of the template's defaults to have a blank slate. We'll still have some of that object-oriented C# feel, but it will be restricted to the console application:

```fsharp
open System.IO
open Microsoft.Extensions.Configuration
open Microsoft.AspNetCore.Hosting
open ProjectName

[<EntryPoint>]
let main argv =
  let config = ConfigurationBuilder()
                  .AddCommandLine(argv)
                  .AddEnvironmentVariables("ASPNETCORE_")
                  .Build()

  let host = WebHostBuilder()
                  .UseConfiguration(config)
                  .UseKestrel()
                  .UseContentRoot(Directory.GetCurrentDirectory())
                  .UseIISIntegration()
                  .UseStartup<Http.Startup>()
                  .Build()
  host.Run()
  0 // exit code
```

and a minimal `Startup` class:

```fsharp
namespace ProjectName

open Microsoft.AspNetCore.Builder
open Microsoft.AspNetCore.Hosting
open Microsoft.Extensions.DependencyInjection
open Microsoft.Extensions.Logging
open Suave.AspNetCore

module Http =
  type Startup() =
    member this.ConfigureServices (services : IServiceCollection) = ()

    member this.Configure (app : IApplicationBuilder, env : IHostingEnvironment, loggerFactory : ILoggerFactory) =
      app.UseSuave(App.app) |> ignore
```

`Suave.AspNetCore` exposes a `UseSuave` extension method on ASP.NET's `ApplicationBuilder` that acts as the connection point between ASP.NET and Suave. Overall, `Suave.AspNetCore` accomplishes this connection through two main pieces:

1. A `SuaveMiddleware` that implements [ASP.NET Middleware](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/middleware)'s method signatures
2. A bi-directional mapping between ASP.NET's `HttpContext` and Suave's `HttpContext`

We can use Suave's API to control request/response pipeline from here, sticking to full F# and Suave's `HttpContext` (opposed to the ASP.NET `HttpContext`).

## Why all this trouble?

We're going through this setup to leverage one of Suave's core principles: the `WebPart`. From Suave's documentation:

> A web part is a thing that acts on a HttpContext, the web part could fail by returning `None` or succeed and produce a new HttpContext. Each web part can execute asynchronously, and it’s not until it is evaluated that the async is evaluated. It will be evaluated on the same fibre (asynchronous execution context) that is consuming from the browser’s TCP socket.

`WebPart`s give two benefits, composability (combining small pieces into larger ones) and asynchronism (which also aids in composability). In essence, it's type boils down to this (which is useful to know as your editor may display either the left-hand side or the right-hand side depending on how F# infers the type for a given expression):

```fsharp
type WebPart = HttpContext -> Async<HttpContext option>
```

where each `WebPart` accepts Suave's `HttpContext` and returns an async option. The option is what gives applications the ability to control execution flow. When execution of a code path should stop, the `WebPart` will return `None`, but otherwise, it will return `Some httpContext` with a new `HttpContext` with any desired updates. Because this process is wrapped in `async`, we aren't penalized too much as our application decides how to handle an incoming request.

> One note to make is that instead of F#'s normal function composition operator (`>>`), Suave exposes a fish operator (`>=>`) to aid in working with `WebPart`s and removes some necessary handling of `Async<HttpContext option>` that aids developer productivity. We'll see this operator in action later on as we build up our application.

## Composing an application

For now, let's just begin with a small starter `WebPart`, thanks to `OK`:

```fsharp
namepsace ProjectName

open Suave
open Helpers
open Suave.Filters
open Suave.Operators
open Suave.RequestErrors
open Suave.Successful

module App =
  let hello name = OK ("hello " + name)
  let app = hello "world"
```

As our application grows, we'll use `choose` to facilitate paths a request may take and `path` to filter part of the decision tree based on request path. Here, we add some basic routes:

```fsharp
module App =
  // ...

  let app =
    choose [
      path "/" >=> hello "world"
      path "/api" >=> NO_CONTENT
      path "/api/users" >=> OK "users"
    ]
```

Not only can we use these combinators to create a decision tree to route requests, we can also create a `WebPart`s to set a header or affect the context other ways:

```fsharp
module App =
  // ...

  let setServerHeader =
    Writers.setHeader "server" "kestrel + suave"

  let app =
    setServerHeader
    >=> choose [
      // ...
    ]
```

We've added `setServerHeader` in our `app` expression at the top level, but it would be just as happy deeper in the expression. `path` can prevent further combinators from affecting the response, so if `setServerHeader` is added after a `path` expression (or some similar combinator), the response will only have the header set if that part of the decision tree is successfull. For instance, with:

```fsharp
module App =
  // ...

  let app =
    choose [
      path "/server" >=> setServerHeader >=> OK "server"
      path "/no-server" >=> OK "no-server"
    ]
```

responses for `/server` will have the `Server` header set with the value `kestrel + suave`, while responses for `/no-server` will have the default value set for the `Server` header, thanks to the `WebPart` type (remember, it returns an `Async<HttpContext option>`).

We can also use `WebPart`s to compose multiple application segments, introducing some order as our application grows:

```fsharp
module App =
  // ...

  let api =
    Writers.setMimeType """application/json; charset="utf-8";"""
    >=> choose [
          path "/api" >=> NO_CONTENT
          path "/api/users" >=> OK """{"api": "users"}"""
        ]

  let web =
    choose [
      path "/" >=> hello "world"
      pathScan "/hello/%s" hello
    ]

  let app = [ api; web; ]
```

## Iterating improvements

Let's see if we can clean up `api` to remove some duplication. I saw this pattern out on the web at some point:

```fsharp
module Paths =
  module Api =
    let root = "/api"
    let users = root + "/users"

module App =
  // ...

  let api =
    Writers.setMimeType """application/json; charset="utf-8";"""
    >=> choose [
          path Paths.Api.root >=> NO_CONTENT
          path Paths.Api.users >=> OK """{"api": "users"}"""
        ]

  // ...
```

I like the separation here, but honestly, I'm not sure it helps the situation much. We still have a similar problem, plus the additional code for managing the paths. Still not acceptable in my book, so lets try something else. My next inclination is to attempt to nest `path` expressions:

```fsharp
module App =
  // ...

  let api =
    Writers.setMimeType """application/json; charset="utf-8";"""
    >=> path "/api"
    >=> choose [
          path "" >=> NO_CONTENT
          path "/users" >=> OK """{"api": "users"}"""
        ]

  // ...
```

Sadly, this doesn't work as expected and results in a `404 Not Found`. I wasn't lucky in looking for an official solution yet, but are custom combinators an option? Let's try to build one. Here's what `path`'s implementation looks like:

```fsharp
let path s (x : HttpContext) =
  // `iff` was internalized to simplify for display here
  let iff b x =
    if b then Some x else None
  async.Return (iff (s = x.request.path) x)
```

Essentially, it checks the path given to `path` against the request's path, returning `None` if there's no match. For our custom combinators, we'll need to check the request path against the string passed to our new `path` as well as the path set above it. `HttpContext` has a `userState` field, meant for storing state information within a single request, perfect for our use-case of storing info about the entire path for a given code path. Here are our new combinators:

```fsharp
module App =
  // ...

  let optionally pred value =
    if pred then Some value else None

  let getCurrentRoot ctx =
    match ctx.userState.TryFind("rootPath") with
    | None -> ""
    | Some p -> string p

  let rootPath (part : string) (ctx : HttpContext) =
    let root = getCurrentRoot ctx
    { ctx with userState = ctx.userState.Add("rootPath", root + part) }
    |> Some
    |> async.Return

  let subPath (part : string) (ctx : HttpContext) =
    let fullPath = (getCurrentRoot ctx) + part
    ctx
    |> optionally (fullPath = ctx.request.path)
    |> async.Return

  // ...
```

`rootPath` allows us to specify a path prefix for `subPath` calls specified deeper in the decision tree. Because `rootPath` stores any previous root path concatenated with the supplied value, we luckily get nesting support beyond a single level. Here's a simple example, clearing up our previous `api` expression:

```fsharp
module App =
  // ...

  let api =
    Writers.setMimeType """application/json; charset="utf-8";"""
    >=> rootPath "/api"
    >=> choose [
          subPath "" >=> NO_CONTENT
          subPath "/users" >=> OK """{"api": "users"}"""
        ]

  // ...
```

> I'm looking to contribute this functionality for inclusion into Suave's API and am currently [awating feedback from the team](https://github.com/SuaveIO/suave/issues/570).

## Take aways

.NET Core is still relatively new when compared to the mainstream .NET Framework. Because of this, Suave's support for it is still in progress (only two of seven additional official packages provide .NET Core support), and community extension of its .NET Core support is still improving (`Suave.AspNetCore` doesn't yet support all of Suave's feature set). As the community progress .NET Core support for F# and its projects, this relative newness feeling should diminish, and Suave + F# applications on the ASP.NET Core stack should be ready for production.

That being said, there's no reason Suave cannot be used with ASP.NET Core in projects where 100% compatibility isn't required. Personal projects, one-off projects, etc. would, in my opinion, give you a chance to use Suave and ASP.NET Core together in a lower-risk situation.
