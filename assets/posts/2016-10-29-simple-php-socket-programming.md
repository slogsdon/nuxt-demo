---
title: Simple PHP Socket Programming
author: shane
layout: post
date: 2016-10-29
categories:
  - All Posts
  - Programming
tags:
  - php
  - sockets
description: PHP isn't just for templates for Apache's mod_php. Let's have fun with socket programming in PHP.
---

While not always useful in a regular PHP web application, socket programming can be a useful tool. Think about it. Instead of being restricted to responding to HTTP requests behind Apache, nginx, etc., you can use PHP to respond to any protocol request through a long-running PHP process.

```bash
# Less of this...
$ curl http://your.server/index.php

# ...and more of this:
$ php server.php
```

On our socket voyage, we're going to use [PHP Streams](http://php.net/manual/en/intro.stream.php), a generalized way of interacting with files, network, data compression, and other operations through a single set of functions.

Let's start with an overview of steps we need to take:

1. Listen on a port
2. Accept an incoming connection
3. Read the request
4. Send a response
5. Close the connection
6. Goto 2

## 1. Listen on a port

We'll use [`stream_socket_server`](http://php.net/function.stream-socket-server) to listen on our desired port:

```php
$server = stream_socket_server($binding);

if (false === $server) {
    throw new Exception('Could not listen');
}
```

`stream_socket_server`'s first and only required parameter is a local socket address that follows the form `transport://target`. For example, we can set this to `tcp://127.0.0.1:1234` to create a TCP server that listens on the `127.0.0.1` address using the port `1234`.

A key point here is the return value of `stream_socket_server` is a stream resource that _contains_ a socket resource. The stream isn't purely the socket. What does that mean? You can use the returned resource wherever a stream resource is accepted (e.g. in the stream functions [`stream_socket_accept`, `stream_get_line`, etc.] and file functions [`fread`, `fclose`, etc.]), but regular socket functions like `socket_read` won't accept the stream as a valid socket resource. There is
`socket_import_stream` that can expose the raw socket resource from a stream, but this doesn't work for all stream transport types.

### Note about unclosed ports

During your development, you may run across something like this:

> Warning: stream_socket_server(): unable to connect to tcp://127.0.0.1:1234 (Address already in use) in server.php on line 3

This typically means one of two things:

1. Another application is using your desired port number
2. Your application is still running from a previous execution

If you're using a free port number, the above warning is most likely caused by your own code still running. You can correct this by stopping other `php` processes on your development machine through Task Manager, Activity Monitor, or something like `killall php`. This can happen if your code exits prematurely, if an uncaught exception or other fatal error occurs for instance.

## 2. Accept an incoming connection

To actually work allow clients to use our server, we will need to accept their incoming connection attempts, using [`stream_socket_accept`](http://php.net/function.stream-socket-accept) to accomplish this:

```php
$client = stream_socket_accept($server);

if (false !== $client) {
    // valid client connection
}
```

`stream_socket_accept`'s first and only required parameter is an active server stream resource and returns another stream resource for the client. This function will block process execution while it waits for a client to connect.

This waiting period will last until `stream_socket_accept`'s timeout is reached. The timeout period defaults to `ini_get("default_socket_timeout")`, which can be changed either globally in your active `php.ini` file or locally through `stream_socket_accept`'s second argument. If changing the default timeout, be sure to set the value to an appropriate value in seconds for your use case.

## 3. Read the request

Once a client has established a connection with the server, it will want something from the server, so it's the server's task to figure that out by reading the client's request from the stream (and eventually respond to it). Here are a couple of stream-centric ways of acquiring data from a client request:

```php
$firstLine = stream_get_line($client, $maxLength, $ending);
$restOfContents = stream_get_contents($client);
```

[`stream_get_line`](http://php.net/function.stream-get-line) will read from the stream until one of these things occurs:

1. `$maxLength` bytes are read
2. `$ending` characters are reached
3. EOF (end-of-file character) is read

When [`stream_get_contents`](http://php.net/function.stream-socket-accept) is called in this case, it will continue to read where `stream_get_line` left off, reading until EOF is read. This behavior can be changed by specifying either/both of the `$maxLength` and `$offset` parameters, but by default, reading will start at the stream's pointer's current position and will read the remainder of the stream.

## 4. Send a response

Just like with file descriptors, socket streams can be full-duplex (they are by default), meaning you can read and write to a single client stream. After reading from a client stream, you will be able to write your response without closing a "read-only stream" nor opening a "write-only stream":

```php
$contents = stream_get_contents($client);
// do something with $contents
stream_socket_sendto($client, $responseData);
```

A benefit [`stream_socket_sendto`](http://php.net/function.stream-socket-sendto) has over, say, `fwrite` is that it can be used to send out of band data (specially flagged data when sent via TCP) as well:

```php
stream_socket_sendto($client, $data, STREAM_OOB);
```

Out of band data could be used to send notification flags to the client, but if used, you will need to ensure clients are able to handle this data properly.

## 5. Close the connection

Once a response has been sent, the server has the option to keep the connection open for future requests from the client or close the client's connection. [`stream_socket_shutdown`](http://php.net/function.stream-socket-shutdown) provides a simple way to ensure a stream is closed properly, giving three options on how that stream is closed:

- `STREAM_SHUT_RD` prevents further reading
- `STREAM_SHUT_WR` prevents further writing
- `STREAM_SHUT_RDWR` prevents further reading and writing

In most cases, you will want to completely close the stream, so `STREAM_SHUT_RDWR` is the best choice:

```php
stream_socket_shutdown($client, STREAM_SHUT_RDWR);
```

## 6. Goto 2

If you want to accept more than one client's connection without needing to restart your server, you will want to create a loop to accept a new client after closing another's connection:

```php
while (true) {
    $client = stream_socket_accept($server);

    if (false !== $client) {
        // interact with client
    }
}
```

With this, our application will start blocking again while it waits for a new client connection, and it will continue to do so until an uncaught fatal error occurs or the process group receives an interrupt signal (`SIGINT` or `Ctrl-C`) or termination request signal (`SIGTERM`).

Some experience with PHP may have alerted you to something interesting about looping this way. Since PHP is single-threaded (it runs a script in one process thread by default), you will only be able to accept one client connection at any given time. If you have a requirement for accepting more than one client at a time, you will have to add additional code to offer that functionality.

## Bonus: Multi-processing

Without using additional extensions (`ext-libevent`, `ext-libev`, `ext-event`, etc.), you can leverage the [PCNTL extension](http://php.net/manual/en/book.pcntl.php) to fork your parent process:

> Note: While this is typically available from PHP distributions, it's not enabled by default when compiling from source, and it's not available in Windows environments.

```php
$i = 0;
while ($i++ < $num_acceptors - 1) {
    $pid = pcntl_fork();
    if (-1 === $pid) {
        error_log('could not fork');
    } else if ($pid) {
        // parent. continue spawning.
        error_log(sprintf('spawned %s', $i));
        continue;
    } else {
        // child. go to accepting
        break;
    }
}

while (true) {
    // accept client connections
}
```

The above code contains two `while` loops: one to create the child forks from the parent and one to get all process accepting client connections. In the first loop, we fork the parent process `$num_acceptors - 1` times as we are going to use the parent process to accept connections as well.

> Caution: This is purely for explanatory reasons. In a production/production-like environment, your parent process should only manage child forks. If your parent does work and exits prematurely, it could kill currently running child processes as well. Bad news!

## An echo server

Putting it all together, a simple echo server using PHP streams may looks something like this:

```php
$binding = 'tcp://0.0.0.0:1234';
$server = stream_socket_server($binding);

if (false === $server) {
    throw new Exception('Could not listen');
}

while (true) {
    $client = stream_socket_accept($server);

    if (false !== $client) {
        stream_copy_to_stream($client, $client);
    }
}
```

We used [`stream_copy_to_stream`](http://php.net/function.stream-copy-to-stream) to simplify reading data from the client and sending that exact data back to the client. Here's a sample `telnet` session of our server in action:

```bash
$ telnet 127.0.0.1 1234
Trying 127.0.0.1...
Connected to localhost.
Escape character is '^]'.
hello
hello
Connection closed by foreign host.
```

Success! Be sure to remember that we've only scratched the surface here with what's possible with socket programming in PHP. There are loads more use cases than simple echo servers, and there are more options for reading from and writing to sockets, managing those sockets, etc. through PHP's various stream-capable functions.
