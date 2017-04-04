---
title: Cross-Compiling Rust Applications for the Onion Omega2 from MacOS
date: 2017-01-11 18:57:01
tags:
  - rust
  - hardware
author: shane
categories:
  - All Posts
  - Programming
description: >-
  Onion's Omega2 SoC computers are a prime target for cross-compiling
  Rust applications, taking care to set up your environment just right
  for the Omega2's MIPS architecture.
---

After recently receiving the shipment for my [Onion Omega2 Kickstarter](https://www.kickstarter.com/projects/onion/omega2-5-iot-computer-with-wi-fi-powered-by-linux/description) reward, I did as any other software developer might do: I started figuring out what it would take to get software running on it. Onion's [Omega2 documentation](https://docs.onion.io/omega2-docs/) has information about installing and using Python, but while this is powerful and aids product adoption, limitations of developing directly on the device soon appear. Limited disk space, limited RAM, and limited CPU speeds will hinder development and builing of most compiled languages. To me, this sounds like a great opportunity to learn how to cross-compile applications, allowing for development and building of applications in my normal development environment. I've been tinkering with Rust recently, so it became my language of choice for this exercise.

**tl;dr** It works.

<blockquote class="twitter-tweet" data-conversation="none" data-lang="en">
    <p lang="en" dir="ltr">
        running <a href="https://t.co/3I3pE2WS4W">https://t.co/3I3pE2WS4W</a>
        and <a href="https://twitter.com/rustlang">@rustlang</a> on an
        <a href="https://twitter.com/OnionIoT">@OnionIoT</a> Omega 2+, cross-compiled from MacOS
        <a href="https://t.co/SdiKSNPZMZ">pic.twitter.com/SdiKSNPZMZ</a>
    </p>
    &mdash; Shane Logsdon (@shanelogsdon)
    <a href="https://twitter.com/shanelogsdon/status/819204972290199553">January 11, 2017</a>
</blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

## Overview of steps needed

Not having cross-compiled applications before, I did some research into what it takes to cross-compile:

- Know your target triple
- Have your application code
- Have a build toolchain from your target available on your host (build) system
- Use the target toolchain to build you application

### What's a triple?

The target triple (or triplet) is an identifier that represents three pieces of information, architecture, vendor, and operating system, and will typically follow the form:

```
<architecture>-<vendor>-<operating-system>
```

### What is going to be built?

I wanted to build something in Rust that was more than a simple "Hello World" application that wrote to the console, so I looked to [Rocket](https://rocket.rs) to build a simple web application server. Let's take a look at the application code to see what we're working with.

> Scaffold the project

```
$ cargo new --bin rocket_testing
     Created binary (application) `rocket_testing` project
$ cd rocket_testing
$ tree
.
├── Cargo.toml
└── src
    └── main.rs

1 directory, 2 files
```

> Add dependencies

```toml
[package]
name = "rocket_testing"
version = "0.1.0"
authors = ["Shane Logsdon <shane@shanelogsdon.com>"]

[dependencies]
rocket = "0.1.4"
rocket_codegen = "0.1.4"
```

Do a quick build to pull our dependencies down:

```
$ cargo build
    Updating registry `https://github.com/rust-lang/crates.io-index`
 Downloading rocket_codegen v0.1.4
 Downloading rocket v0.1.4
 Downloading num_cpus v1.2.1
 Downloading libc v0.2.19
   Compiling libc v0.2.19
   Compiling typeable v0.1.2
   Compiling traitobject v0.0.1
   Compiling language-tags v0.2.2
   Compiling unicode-normalization v0.1.3
   Compiling winapi v0.2.8
   Compiling rustc-serialize v0.3.22
   Compiling ansi_term v0.9.0
   Compiling httparse v1.2.1
   Compiling log v0.3.6
   Compiling mime v0.2.2
   Compiling hpack v0.2.0
   Compiling rocket_codegen v0.1.4
error[E0554]: #[feature] may not be used on the stable release channel
 --> /Users/shane.logsdon/.cargo/registry/src/github.com-1ecc6299db9ec823/rocket_codegen-0.1.4/build.rs:1:1
  |
1 | #![feature(slice_patterns)]
  | ^^^^^^^^^^^^^^^^^^^^^^^^^^^

error: aborting due to previous error

Build failed, waiting for other jobs to finish...
error: Could not compile `rocket_codegen`.

To learn more, run the command again with --verbose.
```

That's right. `rocket_codegen` requires some Rust nightly features at the moment, so lets use `rustup` to override our current Rust toolchain:

```
$ rustup override set nightly
info: using existing install for 'nightly-x86_64-apple-darwin'
info: override toolchain for '/Users/shane.logsdon/Code/rust/rocket_testing' set to 'nightly-x86_64-apple-darwin'

  nightly-x86_64-apple-darwin unchanged - rustc 1.15.0-nightly (71c06a56a 2016-12-18)

$ cargo build
```

That time should do it if you're using a nightly release for the first time, but if your've already had a nightly installed, you may run into this issue:

```
Build failed, waiting for other jobs to finish...
error: failed to run custom build command for `rocket_codegen v0.1.4`
process didn't exit successfully: `/Users/shane.logsdon/Code/rust/rt/target/debug/build/rocket_codegen-0930e5f9972e7ac3/build-script-build` (exit code: 101)
--- stderr
Error: Rocket codegen requires a newer version of rustc.
Use `rustup update` or your preferred method to update Rust.
Installed version is: 2016-12-18. Minimum required: 2017-01-03.
thread 'main' panicked at 'Aborting compilation due to incompatible compiler.', /Users/shane.logsdon/.cargo/registry/src/github.com-1ecc6299db9ec823/rocket_codegen-0.1.4/build.rs:62
note: Run with `RUST_BACKTRACE=1` for a backtrace.
```

We're told that our installed version of Rust nightly is too old, and we need to install a newer one. Luckily, it's a couple of quick commands to fix:

```
$ rustup update && cargo update && cargo build
# ... eventually seeing
Finished debug [unoptimized + debuginfo] target(s) in 36.35 secs
```

Once our initial build completes, we'll want to update our application code in `src/main.rs` to leverage Rocket:

```rust
#![feature(plugin)]
#![plugin(rocket_codegen)]

extern crate rocket;

#[get("/text")]
fn hello() -> String {
    String::from_str("hello world")
}

fn main() {
    rocket::ignite()
        .mount("/", routes![hello])
        .launch();
}
```

We can then build again and test our application (Rocket listens on [`http://localhost:8000/`](http://localhost:8000/) by default). At this point we have a working application for our host system, which in my case has the triple `x86_64-apple-darwin`.

## Where do we find our target build toolchain?

Since we now have a working application, we need to figure out how to get our application cross-compiled. Some googling resulted in some useful information specifically for Rust. [`rust-cross`](https://github.com/japaric/rust-cross) has some excellent information on this process, but since I didn't even know what the Omega2's architecture was, I figured I better find out. I booted up my Omega2+ and `ssh`'d into it:

```
$ ssh root@192.168.3.1
root@192.168.3.1's password:


BusyBox v1.25.1 () built-in shell (ash)

   ____       _             ____
  / __ \___  (_)__  ___    / __ \__ _  ___ ___ ____ _
 / /_/ / _ \/ / _ \/ _ \  / /_/ /  ' \/ -_) _ `/ _ `/
 \____/_//_/_/\___/_//_/  \____/_/_/_/\__/\_, /\_,_/
 W H A T  W I L L  Y O U  I N V E N T ? /___/
 -----------------------------------------------------
   Ω-ware: 0.1.7 b139
 -----------------------------------------------------
root@Omega-708F:~# uname -a
Linux Omega-708F 4.4.39 #0 Thu Dec 29 17:07:01 2016 mips GNU/Linux
root@Omega-708F:~#
```

That told me enough to start my search for the reuired build chain. At this point, I went to `rustup` to see what architecture's it supported.

> Side note: `rustup` not only manages Rust stable, beta, and nightly installations but also manages Rust toolchains for all the architectures Rust supports!

```
$ rustup target list
aarch64-apple-ios
aarch64-linux-android
aarch64-unknown-linux-gnu
arm-linux-androideabi
arm-unknown-linux-gnueabi
arm-unknown-linux-gnueabihf
arm-unknown-linux-musleabi
arm-unknown-linux-musleabihf
armv7-apple-ios
armv7-linux-androideabi
armv7-unknown-linux-gnueabihf
armv7-unknown-linux-musleabihf
armv7s-apple-ios
asmjs-unknown-emscripten
i386-apple-ios
i586-pc-windows-msvc
i586-unknown-linux-gnu
i686-apple-darwin
i686-linux-android
i686-pc-windows-gnu
i686-pc-windows-msvc
i686-unknown-freebsd
i686-unknown-linux-gnu
i686-unknown-linux-musl
mips-unknown-linux-gnu
mips-unknown-linux-musl
mips64-unknown-linux-gnuabi64
mips64el-unknown-linux-gnuabi64
mipsel-unknown-linux-gnu
mipsel-unknown-linux-musl
powerpc-unknown-linux-gnu
powerpc64-unknown-linux-gnu
powerpc64le-unknown-linux-gnu
s390x-unknown-linux-gnu
wasm32-unknown-emscripten
x86_64-apple-darwin (default)
x86_64-apple-ios
x86_64-pc-windows-gnu
x86_64-pc-windows-msvc
x86_64-rumprun-netbsd
x86_64-unknown-freebsd
x86_64-unknown-linux-gnu
x86_64-unknown-linux-musl
x86_64-unknown-netbsd
```

`rustup` is showing 6 `mips`-related targets. We've narrowed it down some, but we still don't know the exact one we require or if Rust/`rustup` even support it. I took to looking through the [community forums](https://community.onion.io/category/2/omega-talk) searching for `mips` and began to see others looking to do some cross-compilation of code. Across a few separate thread, I put together some information:

- The Omega2's use the MediaTek MT7688 SoC (system on chip) which include a MIPS&reg; 24KEc&trade; CPU
- The Omega2 OS is based on the [LEDE Project](https://lede-project.org/), a fork of the OS behind OpenWrt
- OpenWrt/LEDE have SDKs for building the OS firmware images which include the build toolchain

Eventually, I found a few forum threads with references to [WereCatf's repository](https://github.com/WereCatf/source), a GitHub fork of the LEDE Project's SDK with the necessary changes to add the Omega2 and Omega2+ build DTS (device tree source) configurations add a few other fixes. With the SDK, we have everything we need to build our application for the Omega2, but now the SDK needs to be built since we only have the source and nothing specific for the Omega2.

## Building the build toolchain

Luckily, the build process for the LEDE SDK is the same as the OpenWrt SDK, and at least for MacOS, the build requirements are the same. I've included OpenWrt's instructions for MacOS 10.11 here, but other versions and OS's can be found on [their documentation site](https://wiki.openwrt.org/doc/howto/buildroot.exigence.macosx).

> 1. Install Xcode or at least Xcode command line tools from the MacOSX App Store
>
> 2. Install [Homebrew](http://brew.sh/).
>
> 3. Add duplicates repository to homebrew for grep formulae:
>     ```
brew tap homebrew/dupes
```
> 4. Install additional formulae:
>     ```
brew install coreutils findutils gawk gnu-getopt gnu-tar grep wget quilt xz
```
> 5. `gnu-getopt` is keg-only, so force linking it:
>     ```
brew ln gnu-getopt --force
```
> 6. To get rid of "date illegal option" you can add to your `.bash_profile` (wasn't required for me):
>     ```
PATH="/usr/local/opt/coreutils/libexec/gnubin:$PATH"
```
> 7. OS X by default comes with a case-insensitive filesystem. OpenWrt won't build on that. As a workaround, create a (Sparse) case-sensitive disk-image that you then mount in Finder and use as build directory:
>     ```
hdiutil create -size 20g -type SPARSE -fs "Case-sensitive HFS+" -volname OpenWrt OpenWrt.sparseimage
hdiutil attach OpenWrt.sparseimage
```
> 8. Change to your newly created and mounted disk image:
>     ```
/Volumes/OpenWrt
```
> 9. Now proceed normally (`git clone…`)

If, like me, you have no idea how to "proceed normally", let me fill you in. We're going to obtain the source, configure it for our needs, and build it.

### Getting the source

This one's going to be quick and simple using `git`:

```
$ git clone https://github.com/WereCatf/source
$ cd source
```

### Configuring the SDK

Since OpenWrt/LEDE can be used on multiple architectures, we need to configure the SDK to be compatible with the Omega2. There are a few ways to do this, but we'll use `make menuconfig` here for a `ncurses`-based configuration process.

> Tip: The menus use `up` and `down` keys to move between options, `left` and `right` to move between commands for a given screen (located at the bottom), `enter` to select a command (usually "Select", "Exit", and "Save"), and `space` to enable/select an option.

The three items we need to set (with desired values) are:

- Target System: `MediaTek Ralink MIPS`
- Subtarget: `MT7688 based boards`
- Target Profile: `Onion Omega2` or `Onion Omega2+`

> Note: I also enabled the `Build the LEDE SDK` and `Package the LEDE-based Toolchain` options, but I have no idea if this affects the end result. They sounded important/useful. Having those enabled allowed for me to use the toolchain later, but I didn't have the desire to go back to check if it was necessary.

Don't forget to save the configuration or else the SDK will build with its defaults.

### Build the toolchain

Building the SDK's toolchain is another easy and simple process, but it takes some time to complete.

```
$ make toolchain/install
```

Let your system do its thing for a while, and do something enjoyable. You can also wait, wait, wait, wait. The good news to take away here is that this only needs to be done once per architecture for your build environment, so if you only use this SDK for the Omega2, it will only need to be built again if you want the build toolchain on another system Docker, etc. Eventually, it should finish, leaving your toolchain within the SDK directory:

```
$ tree -L 1 staging_dir/toolchain-mipsel_24kc_gcc-5.4.0_musl-1.1.15
staging_dir/toolchain-mipsel_24kc_gcc-5.4.0_musl-1.1.15
├── bin
├── include
├── info.mk
├── initial
├── lib
├── lib32 -> lib
├── lib64 -> lib
├── libexec
├── mipsel-openwrt-linux -> mipsel-openwrt-linux-musl
├── mipsel-openwrt-linux-musl
├── share
├── stamp
└── usr

12 directories, 1 file
```

Cool. From `rustup`'s possible `mips` targets (pasted below), we may be able to choose one finally:

```
mips-unknown-linux-gnu
mips-unknown-linux-musl
mips64-unknown-linux-gnuabi64
mips64el-unknown-linux-gnuabi64
mipsel-unknown-linux-gnu
mipsel-unknown-linux-musl
```

Our toolchain seems to be for the `mipsel` architecture and is compatible with `musl`, a `libc` compatible library for compiling statically-linked applications, so the `mipsel-unknown-linux-musl` Rust toolchain could work for us. Attempting to run `cargo compile` at this point will result in a big wall of text and the following error:

```
$ cd project/directory
$ rustup target add mipsel-unknown-linux-musl
$ cargo build --target mipsel-unknown-linux-musl
$ ... big wall of text
ld: unknown option: --as-needed
clang: error: linker command failed with exit code 1 (use -v to see invocation)


error: aborting due to previous error

error: Could not compile `rocket_testing`.
```

This is due to my host system's linker (`/usr/bin/cc`) being used during the build but being incompatible with the `mipsel` architecture. Being completely new to cross-compilation, I had no idea how to use the correct build toolchain. Luckily, Rust ecosystem developers love documentation, and Cargo's documentation includes a page on [configuration](http://doc.crates.io/config.html) that gave me a hint in the `target.$triple.linker` configuration key:

```
[target.mipsel-unknown-linux-musl]
linker = "/Volumes/OpenWrt/lede/staging_dir/toolchain-mipsel_24kc_gcc-5.4.0_musl-1.1.15/bin/mipsel-openwrt-linux-musl-gcc"
```

Adding that to my `Cargo.toml` file &hellip; didn't help. Turns out that target configuration options are ignored in a project's `Cargo.toml` and need to be in a `.cargo/config` (also covered by the Cargo documentation page on configuration). The resulting directory structure with the added `.cargo/config` file:

```
$ tree -a -L 2
.
├── .cargo
│   └── config
├── .gitignore
├── Cargo.lock
├── Cargo.toml
├── src
│   └── main.rs
└── target
    ├── debug
    ├── mipsel-unknown-linux-musl
    └── release

6 directories, 5 files
```

Running `cargo build` again bears some results:

```
$ cargo build --target=mipsel-unknown-linux-musl
   Compiling rocket_testing v0.1.0 (file:///Users/shane.logsdon/Code/rust/rocket-testing)
    Finished debug [unoptimized + debuginfo] target(s) in 2.27 secs
```

It's built, but does it run? Let's ship it over to the Omega2+ to test:

```
$ cargo build --target=mipsel-unknown-linux-musl --release
# ... build log
    Finished release [optimized] target(s) in 305.51 secs
$ scp target/mipsel-unknown-linux-musl/release/rocket_testing root@192.168.3.1:/root/
rocket_testing                                        100%   17MB  93.1KB/s   03:04
```

That uploaded the application's release binary to the root user's `$HOME` directory and can be ran with `cd /root && ./rocket_testing`:

<blockquote class="twitter-tweet" data-conversation="none" data-lang="en">
    <p lang="en" dir="ltr">
        running <a href="https://t.co/3I3pE2WS4W">https://t.co/3I3pE2WS4W</a>
        and <a href="https://twitter.com/rustlang">@rustlang</a> on an
        <a href="https://twitter.com/OnionIoT">@OnionIoT</a> Omega 2+, cross-compiled from MacOS
        <a href="https://t.co/SdiKSNPZMZ">pic.twitter.com/SdiKSNPZMZ</a>
    </p>
    &mdash; Shane Logsdon (@shanelogsdon)
    <a href="https://twitter.com/shanelogsdon/status/819204972290199553">January 11, 2017</a>
</blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

## Departing notes

I don't believe this is perfect, but it will get the majority of applications compiled for the Omega2. I've already ran into an issue when using [Diesel](http://diesel.rs) and Postgres in a project, but I feel like it only needs some tweaking to get it going. This post will be updated once I figure that bit out.

The Omega2 isn't the only build target available for Rust, as shown by `rustup target list`, and is accompanied by `arm` (e.g. Raspberry Pi Zero), `armv7` (e.g. Raspberry Pi 2 Model B), and `wasm32` (WebAssembly, currently available in Chrome Canary and Firefox Nightly). Cross-compilation could allow you to target all these platforms with the same code base, useful if you're building an Internet of Things [~~botnet~~](http://www.welivesecurity.com/2016/10/24/10-things-know-october-21-iot-ddos-attacks/) application and want to use multiple device types, or it could allow you to ship compiled binaries for your customers's various production environments using a single build environment configuration.
