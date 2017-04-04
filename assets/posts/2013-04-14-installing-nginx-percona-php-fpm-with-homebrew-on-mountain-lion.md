---
title: Installing nginx/percona/php-fpm with homebrew on Mountain Lion
author: shane
layout: post
date: 2013-04-14
categories:
  - All Posts
tags:
  - devops
  - homebrew
  - mysql
  - nginx
  - percona
  - php
alias:
  - /installing-nginx-percona-php-fpm-with-homebrew-on-mountain-lion/
  - /installing-nginxperconaphp-fpm-with-homebrew-on-mountain-lion/
  - /devops/installing-nginx-percona-php-fpm-with-homebrew-on-mountain-lion/
  - /post/installing-nginx-percona-php-fpm-with-homebrew-on-mountain-lion/
  - /posts/devops/installing-nginx-percona-php-fpm-with-homebrew-on-mountain-lion/
---

If it helps anyone else, that's an added bonus, but this is mainly just a reference point for me; I'm always forgetting what all needs to be done setting up a development environment going. [MNPP][1] doesn't seem to work well, and I'm too cheap at the moment to pay for for [MAMP Pro][2]. Plus, MAMP uses Apache which I've been trying to get away from for the past few months because of its slowness.

<!--more-->

## Preparation

```bash
# Get Xcode via the App Store and install command-line tools (1.6+GB)

# Grab homebrew
ruby -e "$(curl -fsSL https://raw.github.com/mxcl/homebrew/go)"

# Grab the taps we'll need later
brew tap josegonzalez/homebrew-php
brew tap homebrew/dupes
```

## Install Percona

This is a drop-in replacement for MySQL with built-in speed improvements. Double plus good.

```bash
brew install percona-server
brew link percona-server
unset TMPDIR
mysql_install_db --verbose --user=`whoami` --basedir="$(brew --prefix percona-server)" --datadir=/usr/local/var/percona --tmpdir=/tmp
mkdir -p ~/Library/LaunchAgents
cp /usr/local/opt/percona-server/homebrew.mxcl.percona-server.plist ~/Library/LaunchAgents/
launchctl load -w ~/Library/LaunchAgents/homebrew.mxcl.percona-server.plist
```

## Install nginx

This little guy's awesome. No overhead for static files. Can act as a reverse-proxy cache for HTTPS content. I prefer [Varnish][3] for HTTP, though.

```bash
brew install nginx
sudo cp `brew --prefix nginx`/homebrew.mxcl.nginx.plist /Library/LaunchDaemons/
sudo sed -i -e 's/`whoami`/root/g' `brew --prefix nginx`/homebrew.mxcl.nginx.plist
sudo mkdir /var/log/nginx/
```

## Install php-fpm

PHP's fastcgi process manager. Kind of a resource hog, but better than using Apache/mod_php.

```bash
brew install --without-apache --with-fpm --with-mysql php54
sudo cp `brew --prefix php54`/homebrew-php.josegonzalez.php54.plist  /Library/LaunchAgents/
sudo launchctl load -w /Library/LaunchAgents/homebrew-php.josegonzalez.php54.plist
php-fpm -v
sudo mv /usr/sbin/php-fpm /usr/sbin/php-fpm.bak
sudo ln -s /usr/local/Cellar/php54/5.4.11/sbin/php-fpm /usr/sbin/php-fpm
php-fpm -v
php -v
sudo mv /usr/bin/php /usr/bin/php.bak
sudo ln -s /usr/local/bin/php /usr/bin/php
php -v
echo 'export PATH=$PATH:/usr/local/sbin' &gt;&gt; ~/.zshrc # or ~/.bash_profile
```

##### Configuration Files

  * `/usr/local/etc/nginx/nginx.conf`
  * `/usr/local/etc/php/5.4/php.ini`
  * `/usr/local/etc/nginx/fastcgi_params`

Stop nginx with `nginx -s stop`, start with `nginx`, and reload config with `nginx -s reload`. Homebrew installs under `/usr/local`, so `sudo` shouldn't be needed when issuing those commands.

Percona steps from [Wizard Mode][4]. nginx and php-fpm steps from [Matthew Holt][5].

 [1]: http://getmnpp.org
 [2]: http://www.mamp.info/en/mamp-pro/
 [3]: https://www.varnish-cache.org/
 [4]: http://wizardmode.com/2012/06/apache-php-mysql-dev-on-os-x-lion-with-a-minimum-of-pain/
 [5]: http://mwholt.blogspot.com/2013/03/install-nginxphpmysql-on-os-x-mountain.html
