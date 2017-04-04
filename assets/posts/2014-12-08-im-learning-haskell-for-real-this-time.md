---
title: I’m Learning Haskell For Real This Time
author: shane
layout: post
date: 2014-12-08
categories:
  - All Posts
  - Programming
tags:
  - elixir
  - erlang
  - functional programming
  - golang
  - haskell
alias: /im-learning-haskell-for-real-this-time/
image: plank-over-lake.jpeg
description: About a couple of years ago, I was looking for something to add to my programming toolbox. Follow me on my journey of learning Haskell.
---

About a couple of years ago, I was looking for something to add to my metaphoric programming toolbox. That something needed to push me beyond PHP and C#. My initial desires were performance related (I mean PHP isn't really known for it's blistering speed), and as I thought about the possibilities, a paradigm shift wasn't out of the question. And so, my quest began.

<!--more-->

## Go for a bit

To keep things a bit easier for myself, my first stop was something that resembled what I already knew: [Go][1]. As "an open source programming language that makes it easy to build simple, reliable, and efficient software", I figured it be right up my alley with what I was trying to achieve.

<center>
  <amp-img width="250" height="340" src="https://golang.org/doc/gopher/frontpage.png" alt="The Go gopher" /></p>

  <p>
    <sup><i>the Go gopher</i></sup>
  </p>

</center>

I found a web framework to use ([revel](https://revel.github.io/)) and built a basic blog that resembled [Obtvse 2](https://github.com/natew/obtvse2"). The simplicity of the language make the work quick, and I felt efficient which isn't always the case when I come across a new language. I went on to create a few learning projects in the language, contributing (or attempting to) to open source projects when I saw fit, but yet, I felt there was something off about the way things were going. _N.B. I later came to know this was because of my use of a rigid framework when starting to use Go, so I wasn't feeling close to the language itself._

## Haskell intro


Venturing on, I decided to try this thing I'd been hearing a lot about: <a href="https://www.haskell.org/">Haskell</a>. According to its homepage, "Haskell makes it easier to produce flexible, maintainable, high-quality software", and that's every software developer's goal, right?

Probably sometime between <a href="http://www.well-typed.com/blog/2014/09/how-we-might-abolish-cabal-hell-part-1/">Cabal Hell</a>, trying to wrap my head around monads, and deciphering all of the operators in use in Haskell source files, I started drifting away from learning Haskell. I remained interested in what it offered, but I was impatient and didn't have the extra time to devote to everything that revolves around the language.

## Erlang (with Elixir soon behind)

While having a go at Go and taking a small detour with Haskell, I ran across [ChicagoBoss](http://www.chicagoboss.org/), a web framework for [Erlang](http://www.erlang.org). Now, this was a few months before the big WhatsApp purchase by Facebook, but I still had heard of Erlang and its use in scalable and fault-tolerant soft real-time systems. I looked things over, went through some tutorials, built some skeleton projects, and even wrote about [a pain-point for some people]({% post_url 2013-10-03-implementing-user-authentication-with-bcrypt-in-chicagoboss %} "Implementing User Authentication with bcrypt in ChicagoBoss"). By all accounts, this framework and language combination was bitchin'.

<center>
  <amp-img width="227" height="95" alt="Elixir logo" src="http://elixir-lang.org/images/logo/logo.png" />
</center>

I soon came across a readme doc in the ChicagoBoss repo about using something called "Elixir" in ChicagoBoss projects. _Hmm_, I wondered. _What's this thing?_ After heading the the [Elixir homepage](http://elixir-lang.org/) and reading that it leverages the Erlang VM and interoperates with Erlang code, offers a more inviting syntax (I later appreciated the Erlang syntax more), and includes nifty features including hygenic macros and the pipe operator, furious Googling ensued.

Over the next year or so, I managed to write the API server for my <a href="https://www.chatblend.com/" title="ChatBlend">old startup</a>, open source numerous projects ([1](https://sugar-framework.github.io/ "Sugar"), [2](https://github.com/slogsdon/mandrillex "Mandrillex"), [3](https://github.com/slogsdon/stripe-elixir "Stripe"), [4](https://github.com/slogsdon/placid "Placid")), and work as a contractor building a concurrent and distributed team collaboration protocol, using Elixir pretty much full-time. The experiences with each one really opened my eyes to functional programming. The composability and testability of pure functions. The possibility of statelessness (ignoring the state of OTP `gen_server`s). The basic simplicity of it all.

While I love Erlang and Elixir and being able to just let it crash, relying on a virtual machine to run my code isn't something I want to do everyday. I'm a big fan of getting native binaries with my portability.

## Haskell for a second time

So through this past year, I've realized I'm drawn to certain language features:

- purely functional
- statically typed
- ability for abstractions
- expressiveness
- usable tooling
- third-party packages/libraries

Can those be used to describe Haskell? Yes. Can other programming languages be described in the same manner? Definitely. Why Haskell?

Personally, I feel as though Haskell is a good fit for me so I can make better software, with being able to leverage its type system and easily know when my functions become impure (and thus, need more tests) both having the biggest influence over me writing better code. _Sidebar: Everyone who writes software or wants to learn how should take a look at language choices, deciding on one or a few for their own needs and not based on what's hip or cool at the time._

Another reason why I want to learn Haskell? I like challenges. So, how am I planning on overcoming the challenge of learning Haskell? I'm not entirely sure of everything needed, but here are a few things that should help me along the way:

- [Chris Allen](http://bitemyapp.com/)'s (**[@bitemyapp](https://twitter.com/bitemyapp)**) [recommended path for learning Haskell](https://github.com/bitemyapp/learnhaskell)
- [Stephen Diehl](http://stephendiehl.com/)'s (**[@smdiehl](https://twitter.com/smdiehl)**) ["What I Wish I Knew When Learning Haskell"](http://dev.stephendiehl.com/hask/)
- [codewars](http://www.codewars.com/) katas

Wish me luck!

 [1]: https://golang.org/
