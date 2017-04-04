---
title: 'Exploring F# with .NET Core and Kestrel'
tags:
  - functional programming
  - .net
  - fsharp
author: shane
categories:
  - All Posts
  - Programming
description: >-
  While not the primary focus of Microsoft's efforts, F# makes for an excellent
  language choice for applications targeting .NET Core.
date: 2016-12-23
modified: 2017-01-22
---

Interested in functional programming, I've always felt F# would be a good tool to have at my disposal considering there are a plethora of .NET-focused development companies around my area. Even though Microsoft focuses its efforts on C# , F# is an excellent and viable alternative for developing applications that target the .NET Core platform, opening hosting options to more than just Windows.

## Basics

F# support is exposed directly in the new `dotnet` CLI tool through the `--lang` option flag which currently supports both C# and F#. Using the `dotnet new` command, we can scaffold a barebones project to dip our feet in F# and .NET Core:

```bash
mkdir hello
cd hello
dotnet new --lang fsharp
```

Once we have our project ready, seeing the result of our efforts is as easy as restoring the project's dependencies with `dotnet restore` and running `dotnet run` which also causes `dotnet build` to run:

> Restoring dependencies

```
$ dotnet restore
log  : Restoring packages for /Users/shane.logsdon/Code/fsharp/hello/project.json...
log  : Restoring packages for tool 'dotnet-compile-fsc' in /Users/shane.logsdon/Code/fsharp/hello/project.json...
log  : Writing lock file to disk. Path: /Users/shane.logsdon/Code/fsharp/hello/project.lock.json
log  : /Users/shane.logsdon/Code/fsharp/hello/project.json
log  : Restore completed in 3702ms.
```

> Building and running the project

```
$ dotnet run
Project hello (.NETCoreApp,Version=v1.1) will be compiled because expected outputs are missing
Compiling hello for .NETCoreApp,Version=v1.1

Compilation succeeded.
    0 Warning(s)
    0 Error(s)

Time elapsed 00:00:06.0706876


Hello World!
```

Rerunning the project without modifying the files will cause the built file to be re-executed without compiling:

```
$ dotnet run
Project hello (.NETCoreApp,Version=v1.1) was previously compiled. Skipping compilation.
Hello World!
```

Be sure to note above that `dotnet new` creates the files in the current working directory. Let's take a look at what comes of that command:

```bash
$ tree
.
├── Program.fs
└── project.json

0 directories, 2 files
```

There's not a lot going on there, so diving into each file won't take long.

### `Program.fs`

The sole code file contains a simple "Hello World" snippet for getting you going:

```fsharp
// Learn more about F# at http://fsharp.org

open System

[<EntryPoint>]
let main argv =
    printfn "Hello World!"
    0 // return an integer exit code
```

As alluded to in the file, Microsoft doesn't spend too much time with detailed example, instead delegating any explanation of F# to [fsharp.org](http://fsharp.org).

### `project.json`

The project's configuration file is pretty standard for .NET Core applications (at least until Microsoft transitions to a MSBuild file once again), but there are a few F# specific items that are necessary to have everything hooked up properly:

```json
{
  "buildOptions": {
    "debugType": "portable",
    "emitEntryPoint": true,
    "compilerName": "fsc",
    "compile": {
      "includeFiles": [
        "Program.fs"
      ]
    }
  },
  "tools": {
    "dotnet-compile-fsc": "1.0.0-preview2.1-*"
  }
}
```

Important point #1 is the inclusion of the F# compiler (`fsc`) as a part of the tools section. This will bring in the compiler along with other NuGet packages when running `dotnet restore` on the project.

Important point #2 to note are the additional build options to make use of the F# compiler, specifically the `buildOptions.compilerName` and `buildOptions.compile` properties. The `compilerName` property needs to be set since the `dotnet` CLI tool defaults to compiling C#. The `compile` property (and `compile.includeFiles`) needs to be set to tell the compiler which files are apart of the project and which order they should be loaded.

## Extended Scaffolding

When looking for scaffolded projects more in line with what is offered through Visual Studio, `dotnet new` isn't going to cut it, and Visual Studio Code (and similar editors) aren't going to have that functionality baked in by default. Luckily, there is a project scaffolding tool called [Yeoman](http://yeoman.io/) that has been adopted and used pretty much since the inception of .NET Core through the [`generator-aspnet` add-on](https://github.com/omnisharp/generator-aspnet), an open source project under the [OmniSharp organization on Github](https://github.com/OmniSharp). Microsoft itself even has documentation around [building projects with Yeoman](https://docs.microsoft.com/en-us/aspnet/core/client-side/yeoman) on its documentation site.


Installation is easy once Node.js and NPM are available:

```
npm install -g yo generator-aspnet
```

and invoking the Yeoman generator is as simple as running `yo aspnet` and answering some questions:

```
$ yo aspnet

     _-----_     ╭──────────────────────────╮
    |       |    │      Welcome to the      │
    |--(o)--|    │  marvellous ASP.NET Core │
   `---------´   │        generator!        │
    ( _´U`_ )    ╰──────────────────────────╯
    /___A___\   /
     |  ~  |
   __'.___.'__
 ´   `  |° ´ Y `

? What type of application do you want to create?
  Web Application Basic [without Membership and Authorization] (F#)
  Web API Application
❯ Web API Application (F#)
  Nancy ASP.NET Application
  Class Library
  Class Library (F#)
  Unit test project (xUnit.net)
(Move up and down to reveal more choices)
```

`generator-aspnet` contains both C# and F# projects, with the F# ones denoted in the selection interface with a suffix of `(F#)`, and all project templates contained within the generator are designed for .NET Core. There is another generator for F# projects, `generator-fsharp`, but those projects are primarily focused on targeting .NET Framework, not .NET Core.

A project created with `yo aspnet` will resemble a standard project layout much more closely, and those based on ASP.NET will have the same `Program` and `Startup` classes that their C#-based brethren contain.

```
$ tree ProjectName
tree
.
├── Controllers.fs
├── Dockerfile
├── Program.fs
├── Properties
│   └── launchSettings.json
├── README.md
├── Startup.fs
├── appsettings.json
├── project.json
├── web.config
└── wwwroot

2 directories, 9 files
```

More than a simple "Hello World" example, a project spun up with the ASP.NET Yeoman generator will get you going with the cross-platform Kestrel server that comes bundled with ASP.NET Core. This will allow for a consistent development and deployment experience across all .NET Core supported platforms, Windows, MacOS, and Linux.

Running the new ASP.NET project will use the same `dotnet run` command but will add some new output during the program's execution:

```
$ dotnet run
Project ProjectName (.NETCoreApp,Version=v1.0) will be compiled because expected outputs are missing
Compiling ProjectName for .NETCoreApp,Version=v1.0

Compilation succeeded.
    0 Warning(s)
    0 Error(s)

Time elapsed 00:00:08.9821561


Hosting environment: Production
Content root path: /Users/shane.logsdon/Code/fsharp/ProjectName
Now listening on: http://localhost:5000
Application started. Press Ctrl+C to shut down.
```

When hitting the project's HTTP endpoint (which defaults to `http://localhost:5000`), you'll see the `Server: Kestrel` header being sent in the response:

```
$ curl -i http://localhost:5000/api/values
HTTP/1.1 200 OK
Date: Fri, 23 Dec 2016 21:45:45 GMT
Transfer-Encoding: chunked
Content-Type: application/json; charset=utf-8
Server: Kestrel

["value1","value2"]
```

There should also be some new logging messages in the terminal with the application running:

```
info: Microsoft.AspNetCore.Hosting.Internal.WebHost[1]
      Request starting HTTP/1.1 GET http://localhost:5000/api/values
info: Microsoft.AspNetCore.Mvc.Internal.ControllerActionInvoker[1]
      Executing action method ProjectName.Controllers.ValuesController.Get (ProjectName) with arguments () - ModelState is Valid
info: Microsoft.AspNetCore.Mvc.Internal.ObjectResultExecutor[1]
      Executing ObjectResult, writing value Microsoft.AspNetCore.Mvc.ControllerContext.
info: Microsoft.AspNetCore.Mvc.Internal.ControllerActionInvoker[2]
      Executed action ProjectName.Controllers.ValuesController.Get (ProjectName) in 255.1666ms
info: Microsoft.AspNetCore.Hosting.Internal.WebHost[2]
      Request finished in 294.6313ms 200 application/json; charset=utf-8
```

I'll count getting this far as a success, even though there hasn't been enough code added to the project. That being said, I still need to take a further dive into both F# and .NET Core, and being a web-focused developer, I will most likely use ASP.NET to explore both of them. What I don't currently like is how the types in the project are too object-oriented. Here's the `ValuesController` from our project:

```fsharp
namespace ProjectName.Controllers

open System
open System.Collections.Generic
open System.Linq
open System.Threading.Tasks
open Microsoft.AspNetCore.Mvc


[<Route("api/[controller]")>]
type ValuesController() =
    inherit Controller()

    // GET api/values
    [<HttpGet>]
    member this.Get() = [| "value1"; "value2" |]

    // GET api/values/5
    [<HttpGet("{id}")>]
    member this.Get(id:int) = "value"

    // POST api/values
    [<HttpPost>]
    member this.Post([<FromBody>]value:string) = ()

    // PUT api/values/5
    [<HttpPut("{id}")>]
    member this.Put(id:int, [<FromBody>]value:string) = ()

    // DELETE api/values/5
    [<HttpDelete("{id}")>]
    member this.Delete(id:int) = ()
```

Even though F# is a multi-paradigm language, defining object-oriented types in it always seems to go against its functional side, resulting in more verbose, less natural code.

## Embracing F#'s Style

Now, the F# project types available with the ASP.NET Yeoman generator are really just translations of the same project types available for C#, so these won't always be inline with best practices of the F# community. If you're interested in going further down the rabbit hole, F# projects like [Suave](https://suave.io), a simple web development library, are continuously improving their support for .NET Core, but at times, they will require some extra work to get going unless there are other templates that can be used to get your project off the ground.

The Suave team is working on bringing their project into the .NET Core limelight to make the process of using Suave and F# on .NET Core as easy as possible. Under their GitHub organization, they even have a [sample project](https://github.com/SuaveIO/Suave-CoreCLR-sample) that can be used as a base for new applications. This will not use the ASP.NET Core Kestrel web server, but will instead use Suave's own HTTP server implementation.

What I'll end up tinkering with is finding a way to bring Suave's HTTP routing combinators (example below) to ASP.NET and Kestrel, getting the best of both world's: Suave's F# native constructs and .NET Core's level of support and progress on the Kestrel server.

> Suave's HTTP routing combinators

```fsharp
open Suave
open Suave.Filters
open Suave.Operators
open Suave.Successful

let app =
  choose
    [ GET >=> choose
        [ path "/hello" >=> OK "Hello GET"
          path "/goodbye" >=> OK "Good bye GET" ]
      POST >=> choose
        [ path "/hello" >=> OK "Hello POST"
          path "/goodbye" >=> OK "Good bye POST" ] ]

startWebServer defaultConfig app
```

*Update Jan 22, 2017*: I've looked into this successfully and [reported my experience with ASP.NET Core and Suave](https://shane.logsdon.io/posts/fiddling-with-asp-dotnet-core-and-fsharp-with-suave/).

## Comments to be Made

Even though progress is being made, there are still some short-comings that will hopefully be resolved as time goes on. F# is still second-class compared to C# and, to some extent, VB.NET in the .NET world, and .NET Core is no exception. C# is, and probably will always be, Microsoft's golden child, so a lot of the .NET Core is stil geared towards C# developers. .NET Core tooling is relatively new and still progressing, so as the F# community puts effort, the gap between F# and C# support should being to close.
