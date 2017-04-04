---
title: Writing API Wrappers with Elixir
author: shane
layout: post
date: 2013-12-08
categories:
  - All Posts
  - Programming
tags:
  - api
  - elixir
  - functional programming
  - mandrill
alias:
  - /writing-api-wrappers-with-elixir/
  - /elixir/writing-api-wrappers-with-elixir/
  - /posts/elixir/writing-api-wrappers-with-elixir/
image: rainy-train-window.jpeg
description: Recently, I built an API wrapper for Mandrill. Let's walk through the steps I used to create it and see if this process might be able to help you in your next project.
---

Recently, I built an API wrapper for [Mandrill][1]. Let's walk through the steps I used to create it and see if this process might be able to help you in your next project.

<!--more-->

## Installing Elixir

If your preferred development environment does not have Elixir installed, you'll need to install it in order to continue on with the walk through. Head over to the [Elixir getting started page][2], and follow their steps under section 1.1.

If you've never messed with Elixir, read the rest of the Elixir getting started page after installing Elixir. It's ok. I'll wait.

Ready? Let's go.

## Setting up our project

Developers using Elixir use `mix` for building, running, and testing their applications. What is `mix`, you ask? Well, from its [intro page][3]:

> Mix is a build tool that provides tasks for creating, compiling, testing (and soon releasing) Elixir projects. Mix is inspired by the Leiningen build tool for Clojure and was written by one of its contributors.

With mix, creating our project is as simple as:

```bash
$ mix new api_wrapper --sup
```

where `api_wrapper` is the name of our project. I'm wanting to build a wrapper for Mandrill's API, so I'll be using `mandrillex` for my project name. If you want a reliable transactional email provider or just want to follow along, check out their [features page][4] and [signup][5]. Psst: it's free up to 10,000 emails per month.

## OTP application

Opening `lib/mandrillex.ex`, we see `mix` has set up a project for us that implements the bare necessities for an [OTP application][6], allowing our wrapper to be included in other projects easier by following the OTP design principles.

```elixir
defmodule Mandrillex do
  use Application.Behaviour

  # See http://elixir-lang.org/docs/stable/Application.Behaviour.html
  # for more information on OTP Applications
  def start(_type, _args) do
    Mandrillex.Supervisor.start_link
  end
end
```

We're going to leverage [HTTPoison][7] for making requests to our API. Lucky for us, HTTPoison exposes a `HTTPoison.Base` module that we can embed into our module with the `use` directive.

```elixir
  ...
  use Application.Behaviour
  use HTTPoison.Base
  ...
```

Now when we want to use our module elsewhere, we can simply make a call to `Mandrillex.start` to start the OTP application and listen for calls we want to send to the API.

We're also going to define `process_url/1` and `process_response_body/1` to make our lives easier when using `HTTPoison`.

```elixir
  ...
  def process_url(endpoint) do
    "https://mandrillapp.com/api/1.0/" <> endpoint <> ".json"
  end

  def process_response_body(body) do
    JSEX.decode!(body, [{:labels, :atom}])
  end
  ...
```

As you might be able to tell, `process_url/1` allows us to shorten our urls from `https://mandrillapp.com/api/1.0/users/ping.json` to `users/ping`, and `process_response_body/1` processes the response we receive automatically before it is returned to us.

## Building out our wrapper

When compiling, Elixir will look for source files in our `lib` directory, as long as the file extensions are correct (standard is `*.ex` for files meant for compilation), and create the corresponding BEAM bytecode files. BEAM, the Erlang VM, is what handles the processes, fault-tolerance, applications, etc. for Erlang, Elixir, and other BEAM-based languages.

Most developers match up module names with directories, e.g. store `Mandrillex` in `lib` and `Mandrillex.Users` in `lib/mandrillex`. We're going to follow suit and place our other module files in `lib/mandrillex`.

Building out all parts of this wrapper would get fairly monotonous, so instead, we'll focus on one endpoint, [`messages/send`][8].

In `lib/mandrillex/messages.ex`, we're going to define our module and the function responsible for handling the `messages/send` endpoint.

```elixir
defmodule Mandrillex.Messages do
  def send(key, message, async, ip_pool, send_at) do
    params = [
      key: key,
      message: message,
      async: async,
      ip_pool: ip_pool,
      send_at: send_at
    ]
    Mandrillex.post("messages/send", JSEX.encode! params).body
  end
end
```

Now, we can send calls to that endpoint with this method.

```elixir
$ iex -S mix
Erlang R16B02 (erts-5.10.3) [source] [64-bit] [smp:4:4] [async-threads:10] [hipe] [kernel-poll:false] [dtrace]

Interactive Elixir (0.11.3-dev) - press Ctrl+C to exit (type h() ENTER for help)
iex> Mandrillex.start
:ok
iex> Mandrillex.Messages.send("your_api_key", [text: "testing", subject: "test subject", from_email: "sending email", from_name: "sending name", to: [[email: "recipient email", name: "recipient name", type: "to"]]], true, nil, nil)
[[email: "recipient email", status: "sent",
_id: "cb03be26672147dc9503ce2f90806492", reject_reason: nil]]
```

Awesomesauce! We just received a successful response from the API using our newly-developed module.

## Streamlining our wrapper

I don't know about you, but since Mandrill's API calls alway need an API key passed, I would hate to have that as a parameter for all of the endpoints. Let's move that into the `Mandrillex` module:

```elixir
  ...
  def key do
    System.get_env("MANDRILL_KEY")
  end
  ...
```

and change `Mandrillex.Messages.send` to suit:

```elixir
  ...
  def send(message, async, ip_pool, send_at) do
    params = [
      key: Mandrill.key,
      message: message,
      async: async,
      ip_pool: ip_pool,
      send_at: send_at
    ]
    Mandrillex.post("messages/send", JSEX.encode! params).body
  end
  ...
```

When starting our `iex` session, our expressions are only slightly different.

```elixir
$ MANDRILL_KEY=your_api_key iex -S mix
Erlang R16B02 (erts-5.10.3) [source] [64-bit] [smp:4:4] [async-threads:10] [hipe] [kernel-poll:false] [dtrace]

Interactive Elixir (0.11.3-dev) - press Ctrl+C to exit (type h() ENTER for help)
iex> Mandrillex.start
:ok
iex> Mandrillex.Messages.send([text: "testing", subject: "test subject", from_email: "sending email", from_name: "sending name", to: [[email: "recipient email", name: "recipient name", type: "to"]]], true, nil, nil)
[[email: "recipient email", status: "sent",
_id: "cb03be26672147dc9503ce2f90806492", reject_reason: nil]]
```

Of course, this is only one way of introducing an environment variable. Be sure to choose the method that makes the most sense for your implementation.

Moving on, I think it'd be nice to have a function that makes the request for me, since I'm always making `POST` requests to Mandrill's API and always JSON-encoding the request body.

In the `Mandrillex` module, we'll add:

```elixir
  ...
  def request(endpoint, body) do
    Mandrillex.post(endpoint, JSEX.encode! body).body
  end
  ...
```

and update `Mandrillex.Messages` once more:

```elixir
  ...
  def send(message, async, ip_pool, send_at) do
    params = [
      key: Mandrill.key,
      message: message,
      async: async,
      ip_pool: ip_pool,
      send_at: send_at
    ]
    Mandrillex.request("messages/send", params)
  end
  ...
```

By doing this, we are able to change our code in one place instead of many places if we were to ever change how JSON is encoded, say if we switched from `jsex` to `exjson`.

If we were making more than `POST` requests, we could add a `method` parameter to `Mandrillex.request` and add other definitions with guard clauses similar to:

```elixir
  ...
  def request(method, endpoint, body) when method == :get do
    Mandrillex.get(endpoint, JSEX.encode! body).body
  end
  def request(method, endpoint, body) when method == :post do
    Mandrillex.post(endpoint, JSEX.encode! body).body
  end
  ...
```

and call it via `Mandrillex.request(:post, "messages/send", params)` in `Mandrillex.Messages.send`. Alternately, we could favor a more Erlang-ish approach with pattern matching:

```elixir
  ...
  def request({:get, endpoint, body}) do
    Mandrillex.get(endpoint, JSEX.encode! body).body
  end
  def request({:post, endpoint, body}) do
    Mandrillex.post(endpoint, JSEX.encode! body).body
  end
  ...
```

and call it by wrapping the previous call's arguments as a tuple, i.e. `Mandrillex.request({:post, "messages/send", params})`.

## Wrapping up

We only have one endpoint covered, but our working function that allows us to make our call in a simple manner can be duplicated to handle all the other endpoints in the Mandrill API.

Now it's your turn to finish up, or if you're the impatient type, head over to [slogsdon/mandrillex][9] on GitHub to look at the current version of `mandrillex` that covers the rest of the endpoints.

 [1]: https://mandrill.com/
 [2]: http://elixir-lang.org/getting_started/1.html
 [3]: http://elixir-lang.org/getting_started/mix/1.html
 [4]: https://mandrill.com/features/
 [5]: https://mandrill.com/signup/
 [6]: http://www.erlang.org/doc/man/application.html
 [7]: https://github.com/edgurgel/httpoison
 [8]: https://mandrillapp.com/api/docs/messages.JSON.html#method-send
 [9]: https://github.com/slogsdon/mandrillex
