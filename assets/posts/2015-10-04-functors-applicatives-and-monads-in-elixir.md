---
title: Functors, Applicatives, and Monads in Elixir
author: shane
layout: post
date: 2015-10-04
categories:
  - All Posts
  - Programming
tags:
  - elixir
  - functional programming
  - haskell
alias:
  - /functors-applicatives-and-monads-in-elixir/
  - /functors-applicatives/
image: side-of-building.jpeg
description: Elixir doesn't have native modules for functors, applicatives, and monads. Is it possible to create them? Is it worth it?
---

> **Big ol' note:** By no means am I an expert on any of the below content. I'm currently learning this to the best of my ability and thought to write down my experiences and thoughts with implementing these in Elixir.

We're going to be comparing Elixir protocols with Haskell's type classes using a go-to type for the subject at hand: `Maybe`. The `Maybe` type encapsulates an optional value. A value of type `Maybe a` either contains a value of type `a` (represented as `Just a`), or it is empty (represented as `Nothing`). Here's how Haskell defines the type:

```haskell
data Maybe a = Just a
             | Nothing
```

Because of Elixir's lack of strong typing and type constructors, we define the Elixir version of `Maybe` slightly different:

```elixir
defmodule Maybe do
  @type t :: %__MODULE__{
    just: term,
    nothing: boolean
  }
  defstruct just: nil,
            nothing: false

  def just(v), do: __MODULE__ |> struct(just: v)
  def nothing, do: __MODULE__ |> struct(nothing: true)
end
```

The struct is acting as a wrapper for the values and the module contains some helper functions to act as a pseudo-replacement for Haskell's type constructors. In Elixir, the type `Maybe a` now either contains a value of type `term` (represented as `Maybe.just(term)`) or is empty (represented as `Maybe.nothing`).

## Functor

Using functors, we can generalize how `Enum.map` works for `Enumerable`s on any data type, including `Maybe`. We can accomplish this by generalizing the action and implementing that action for the desired data types. This generalized action for Functors is known as `fmap`. Take a look at the definition for the `Functor` protocol:

```elixir
defprotocol Functor do
  @spec fmap(t, (term -> term)) :: t
  def fmap(functor, fun)
end
```

and compare it to Haskell's `Functor` type class:

```haskell
class Functor f where
    fmap :: (a -> b) -> f a -> f b
```

We can start to see similarities between the two purely by looking at the types. Both require a functor and function as arguments. Haskell's `f a` represents a functor with a type constructor of `a`, similar to `[a]` being a list of `a`s. You may notice that the order of the arguments in both differ. This mostly has to do with how Elixir's Protocol dispatch process works as it looks at the first argument's type in order to dispatch the call to the correct implementation.

Now, any type that wishes to be a functor only needs to implement the `fmap` function, using Elixir's `defimpl` macro or Haskell's `instance` keyword:

```elixir
defimpl Functor, for: Maybe do
  def fmap(%{nothing: true} = f, _), do: f
  def fmap(%{just: a}, fun) do
    fun
    |> apply([a])
    |> Maybe.just
  end
end
```

```haskell
instance Functor Maybe  where
    fmap _ Nothing  = Nothing
    fmap f (Just a) = Just (f a)
```

While the Haskell version is more concise, they both define the same core functionality. Calling `fmap` on a "nothing" will always return a "nothing", ignoring the function that is passed as well. Calling `fmap` on a value will unwrap the value by pattern matching the `Maybe` functor and applying the passed function on the value.

### Defining and Using Functors

Let's take a look at what this looks like in use:

```elixir
f0 = fn x -> x + 2 end

Maybe.just(5)      # Define
|> Functor.fmap(f0) # Use
# %Maybe{just: 7, nothing: false}
```

Since our functors in Elixir are just simple structs, our "Just 5" value can be defined in the same variety of ways: `Maybe.just(5)`, `%Maybe{just: 5}`, `struct(Maybe, just: 5)`, etc. The power of the functor comes from the `Functor` protocol. When we want to work with the functor, we pass it to `fmap/2` along with a function, in this case a small anonymous function that adds `2`. From here, Elixir's protocol dispatch takes over, inspecting the functor's type to direct the call to the functor's implementation of `fmap/2`.

The result of `fmap/2` is another functor, so if necessary, we can continue to pipe additional calls to `fmap/2`. At any time during this pipeline, any one of the included functions could potentially return a "nothing" value (`Maybe.nothing`) without throwing an error.

```elixir
f1 = fn x-> x + 2 end
f2 = fn _ -> Maybe.nothing end
f3 = fn x -> x * 3 end

Maybe.just(5)
|> Functor.fmap(f1)
|> Functor.fmap(f2)
|> Functor.fmap(f3)
# %Maybe{just: nil, nothing: true}
```

In a real world situation, this allows us to worry less about catching and accounting for possible points of failure since our implementation of `Functor` for `Maybe` already accounts for this case (remember, calling `fmap` on a "nothing" will always return a "nothing").

## Applicative (Functor)

> _I'm going to leave out the Haskell from here until I can figure how to handle a few things better in Elixir._

Applicatives (or more specifically applicative functors) are a special form of `Functor` where the value within the functor is a function.

```elixir
defprotocol Applicative do
  @spec apply(t, Functor.t) :: t
  def apply(fun, f)
end
defimpl Applicative, for: Maybe do
  def apply(%{nothing: true} = f, _), do: f
  def apply(%{just: fun}, f) do
    f |> Control.Functor.fmap(fun)
  end
end
```

`Maybe` is now a `Functor` as well as an `Applicative`. Again, our `Maybe` implementation of `Applicative` destructures the first argument, returning a "nothing" value if one is present. However, now it is expected that the value in our functor is a function of type `(term -> term)`. Here's an example where this would be useful:

```elixir
f4 = fn file ->
  case File.stat(file) do
    {:ok, s} ->
      Maybe.just(&(&1 |> magic_function(s))
    {:error, _} ->
      Maybe.nothing
  end
end
```

> _I know this is a convoluted example with simpler alternatives. Let me know if you have a better example for this._

In this specific case, we've created a closure over the `File.Stat` variable (`s`) using it in an eventual call to our `magic_function/2` function. We only want the call to `magic_function/2` to occur when the file actually exists, so `Maybe` comes in to save the day.

Because our anonymous function is wrapped in a `Maybe`, it might be tricky call this function with another `Maybe`. We could pull out the function manually:

```elixir
# "something.txt" exists
%Maybe{just: f5} = f4.("something.txt")
```

But this would need to be duplicated everywhere it was necessary. There also may be cases where this process would be too cumbersome to carry out manually. Lucky for us, the implementations of `Applicative.apply/2` will handle this for all functors that have it available.

```elixir
f4.("something.txt")
|> Applicative.apply(Maybe.just(5))
```

## Monad

While I definitely don't want to go down the "let's describe what a monad is" road, I will say I've read that it is best to think of a monad as an abstract data type of actions. A list monad represents actions on a list. An IO monad represents actions on IO.

```elixir
defprotocol Monad do
  @spec bind(t, (term -> t)) :: t
  def bind(m, fun)
end
```

Without going into detail just yet on `Monad`, did you notice any similarities to `Functor` and `Applicative`? Here are their typespecs right next to each other (expanding `Applicative`'s to clear it up):

```elixir
@spec fmap( t, (term -> term)) :: t             # Functor
@spec apply(t [(term -> term)], Functor.t) :: t # Applicative
@spec bind( t, (term -> t)) :: t                # Monad
```

They all accept a value and a function to modify that value, returning the type again.

In `Functor.fmap/2`, we take an unwrapped value, apply the function, and return a wrapped result. In `Applicative.apply/2`, we do the same as `Functor.fmap/2`, but the function is wrapped as well as the value. In `Monad.bind/2`, we do the same as `Functor.fmap/2` as well, but the function argument returns the wrapped value opposed to it being wrapped after the fact.

```elixir
defimpl Monad, for: Maybe do
  def bind(%{nothing: true} = f, _), do: f
  def bind(%{just: v}, fun) do
    fun |> apply([v])
  end
end
```

Following the types, the implementation for `bind/2` looks very similar to that of `fmap/2` and `apply/2` because they are all similar. The difference come down to how the functions receive the data and how it expects the function to transform that data.

## Wrapping Up

In my eyes, it's yet to be determined whether or not Elixir and Erlang really need functors, applicatives, and monads. The data types that follow these protocols can structure things in a way so that they can hide state, side-effects, etc. away from the pure side of the code, and Haskell uses them to it's advantage to become more than just an academic language and to be able to solve real world problems.

But since Elixir is a dynamic language, we don't always have the compiler to tell us what to do. We can add side-effecting code in our pure functions and others would be none the wiser, but typically, Elixir and Erlang developers will hide the same state, side-effects, etc. away into designated actors. There's no need for a `State` monad to maintain state between function calls because we have abstractions around actors like `GenServer` and `Agent` to do this for us, interfacing with those actors by message passing.

I'm going to keep going down this adventurous path for a little while longer, but I don't quite yet see how many cases that I'd use these in lieu of actors.

> If you're interested in seeing the code behind this post, take a look at [`Control`][1], an exploratory look into functors, applicatives, and monads for Elixir.

 [1]: https://github.com/slogsdon/elixir-control
