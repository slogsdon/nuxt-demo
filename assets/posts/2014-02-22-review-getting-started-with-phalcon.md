---
title: 'Review: Getting Started with Phalcon'
author: shane
layout: post
date: 2014-02-22
categories:
  - All Posts
  - Programming
tags:
  - phalcon
  - php
  - review
alias:
 - /review-getting-started-with-phalcon/
 - /php/review-getting-started-with-phalcon/
image: look-up-towards-skyscrapers.jpeg
description: Stephan A. Miller brings the self-proclaimed “fastest PHP framework” to the masses in his new book, Getting Started with Phalcon.
---

With most newcomers to development frameworks, acclimating to the idea of the model-view-controller (MVC) pattern can be one of the biggest challenges. The [Phalcon PHP framework][1] pose an additional barrier to entry, installation. Having both of these to overcome, let's see how Stephan A. Miller brings the self-proclaimed "fastest PHP framework" to the masses in his new book, **[Getting Started with Phalcon][2]**.

<!--more-->

## Problem #1: Installation

Miller logically begins his book with installing Phalcon. Since most people dread manually installing packages as it requires compiling software from their source, he eases them through this process by offering a step-by-step walkthrough, with sections for Windows, Mac OS, Linux, and FreeBSD.

All of the main operating systems are detailed, as well as the two prominent web servers used across the web, Apache and nginx. Readers of **Getting Started with Phalcon** will be able to use the information contained in the first chapter to guide them through the installation process for their development, testing, and production environments.

## Problem #2: MVC

In the remaining four chapters, Miller explains the intricacies of using the MVC pattern with Phalcon with ease, building a blog application in the process.

Models, views, and controllers were explained so that newcomers to the MVC pattern could understand the benefit of the pattern, keeping this simple at the start and gradually adding more Phalcon-related goodness as the project and book progressed.

Miller made sure to keep his code examples concise and up-to-par with modern PHP coding standards. Below is an excerpt from the third chapter, specifically part of the `Posts` controller for the project:

```php
<?php
public function searchAction()
{
    $numberPage = 1;
    if ($this->request->isPost()) {
        $query = Criteria::fromInput($this->di, "Posts", $_POST);
        $this->persistent->parameters = $query->getParams();
    } else {
        $numberPage = $this->request->getQuery("page", "int");
    }

    $parameters = $this->persistent->parameters;
    if (!is_array($parameters)) {
        $parameters = array();
    }
    $parameters["order"] = "id";

    $posts = Posts::find($parameters);
    if (count($posts) == 0) {
        $this->flash->notice("The search did not find any posts");
        return $this->dispatcher->forward(array(
            "controller" => "posts",
            "action" => "index"
        ));
    }

    $paginator = new Paginator(array(
        "data" => $posts,
        "limit"=> 10,
        "page" => $numberPage
    ));

    $this->view->page = $paginator->getPaginate();
}
```

## Recap

Overall, Stephan Miller's **Getting Started with Phalcon** is an encompasing overview of the Phalcon PHP framework. While it doesn't cover all of the features or all of the technical details about the framework, it does cover the main points, models and [PHQL][3], views and [Volt][4], controllers, and dependency injection included.

I believe that Miller has achieved his goal of being able to empower developers, new and old, with the skills needed to create applications with Phalcon. While newer developers will naturally have more to learn, all PHP developers will be able to pick up this book and use it to learn this new-ish framework that has been steadily gaining steam in the PHP world.

 [1]: http://phalconphp.com/
 [2]: http://www.packtpub.com/getting-started-with-phalcon/book
 [3]: http://docs.phalconphp.com/en/latest/reference/phql.html
 [4]: http://docs.phalconphp.com/en/latest/reference/volt.html
