---
title: ASP.NET Core WebAPI in Azure App Service
tags:
  - .net
  - csharp
  - azure
author: shane
categories:
  - All Posts
  - Programming
  - Devops
description: >-
  In my opinion, Azure App Services are an easy and direct way to launch your
  ASP.NET Core application for the outside world to access. Azure App Service
  offers a free tier, perfect for tinkering or getting a new project off the
  ground.
date: 2017-01-21 00:12:50
modified: 2017-02-03
---

In my opinion, Azure App Services are an easy and direct way to launch your ASP.NET Core application for the outside world to access. Azure App Service offers a free tier, perfect for tinkering or getting a new project off the ground.

## Prepare the Application

While you can always use an existing .NET Core project, generating a new project is always an option and one we are going to take today. Without going too far into this process, we need to have a .NET Core project and add that project to a local Git repository.

> First comes the code:

```
$ yo aspnet
$ cd ProjectName
$ dotnet restore
$ dotnet build
```

> Then comes the commit:

```
$ git init
$ git commit -am "Initial commit"
```

## Create App Service

Adding a new App Service resource to your Azure account is fairly straightforward with Azure's portal, adding a "Web App" under "Web + Mobile" in the new resource pane.

{% img w-100 /assets/images/asp-dotnet-core-webapi-in-azure-app-service/create-new-resource.png %}

When going through the initial setup, you'll be prompted for a few pieces of information:

- App name
- Subscription
- Resource Group
- App Service plan/Location

Once finalized, you'll be able to click the "Create" button. You'll notice a notification near the upper right-hand of the portal stating your deployment has started. Wait for your notification that the deployment was succesful, and find your App Service resource, either under "All Resources" or on your dashboard if you elected to pin it there. Most of what we'll do from here will stem from the resource pane that appears once you click your App Service resource.

If you haven't set up a deployment user/password on your Azure account before, Goto App Deployment > Deployment Credentials

{% img w-100 w-50-l /assets/images/asp-dotnet-core-webapi-in-azure-app-service/app-deployment.png %}

which will require you enter the following:

- FTP/deployment username
- Password
- Confirm password

The username/password combination you're configuring will allow you to use their FTP service and Git through HTTPS.

## Local Git deployment

By default, Azure App Service resources use FTP for deployment, meaning we need to manually connect via FTP and upload a built version of our application. Git deployment simplifies this by allowing us to push our raw source code to Azure and have the build + deployment processes occur automatically. To get Git deployment enabled on our App Service, we'll need to go to App Deployment > Deployment Options, select "Local Git Repository" for the source and confirm by clicking "Ok".

- Choose Source -> Local Git Repository
- Ok

Under Settings > Properties, copy the Git URL for your resource. We'll use this as the remote for our local Git repository, pushing our current master branch to Azure:

```
$ git remote add azure https://slogsdon@slogsdon-projectname.scm.azurewebsites.net:443/slogsdon-projectname.git
$ git push azure master
Password for 'https://slogsdon@slogsdon-projectname.scm.azurewebsites.net:443':
Counting objects: 14, done.
Delta compression using up to 8 threads.
Compressing objects: 100% (12/12), done.
Writing objects: 100% (14/14), 6.07 KiB | 0 bytes/s, done.
Total 14 (delta 0), reused 0 (delta 0)
remote: Updating branch 'master'.
remote: Updating submodules.
remote: Preparing deployment for commit id '660e32f957'.
remote: Generating deployment script.
remote: Project file path: .\project.json
remote: Generated deployment script files
remote: Running deployment command...
remote: Handling ASP.NET Core Web Application deployment.
remote: Restoring packages for D:\home\site\repository\project.json...
remote:   GET https://api.nuget.org/v3-flatcontainer/microsoft.netcore.app/index.json
remote:   GET https://api.nuget.org/v3-flatcontainer/microsoft.aspnetcore.mvc/index.json
# ... package restore
remote: ....................
remote: Committing restore...
remote: Writing lock file to disk. Path: D:\home\site\repository\project.lock.json
remote: D:\home\site\repository\project.json
remote: Restore completed in 151105ms.
remote:
remote: NuGet Config files used:
remote:     C:\DWASFiles\Sites\#1slogsdon-projectname\AppData\NuGet\NuGet.Config
remote:
remote: Feeds used:
remote:     https://api.nuget.org/v3/index.json
remote:
remote: Installed:
remote:     259 package(s) to D:\home\site\repository\project.json
remote: Microsoft (R) Build Engine version 15.1.0.0
remote: Copyright (C) Microsoft Corporation. All rights reserved.
remote:
remote: Build started 1/1/2017 5:50:46 PM.
remote: Project "D:\home\site\repository\project.json" on node 1 (Publish target(s)).
remote: MSBUILD : error MSB4025: The project file could not be loaded. Data at the root level is invalid. Line 1, position 1. [D:\home\site\repository\project.json]
remote: Done Building Project "D:\home\site\repository\project.json" (Publish target(s)) -- FAILED.
remote:
remote: Build FAILED.
remote:
remote: "D:\home\site\repository\project.json" (Publish target) (1) ->
remote:   MSBUILD : error MSB4025: The project file could not be loaded. Data at the root level is invalid. Line 1, position 1. [D:\home\site\repository\project.json]
remote:
remote:     0 Warning(s)
remote:     1 Error(s)
remote:
remote: Time Elapsed 00:00:00.20
remote: Failed exitCode=1, command=dotnet publish "project.json" --output "D:\local\Temp\8d4326e571d5047" --configuration Release
remote: An error has occurred during web site deployment.
remote:
remote: Error - Changes committed to remote repository but deployment to website failed.
To https://slogsdon-projectname.scm.azurewebsites.net:443/slogsdon-projectname.git
 * [new branch]      master -> master
```

Awesome. Kudu (Azure's Git deployment engine) is detecting the project is .NET Core, but it's using MSBuild to build the project. MSBuild apparently isn't compatible with `project.json`. Now what?

> Two weeks later

After taking a break, I decided to use my brain and found this [StackOverflow answer](http://stackoverflow.com/a/40658723/771757) which was the key to correcting the `MSB4025` issue. The fix is to add a `global.json` file to your project with a specification with the specific version of the SDK being used locally.

If generating a project with `dotnet new` or `yo aspnet`, you'll need to move your project around as well to accomodate the `global.json` file's way of specifying projects:

```
$ cd ProjectName/..
$ mkdir src
$ mv ProjectName src
$ touch global.json
$ tree -L 2
.
├── global.json
└── src
    └── ProjectName

2 directories, 1 file
```

Big take away is that your existing files need to move into a directory under `src` (or whatever you choose to name it). From there, we need to add some content to `global.json`:

```json
{
  "projects": [ "src" ],
  "sdk": { "version": "1.0.0-preview2-1-003177" }
}
```

*Update 03 February 2017*: Moving your project files to `src` does not seem to be a hard requirement. Dan Clarke pointed this out to me [via Twitter](https://twitter.com/dracan/status/827406653754531840), stating the following `global.json` file should work as well:

```json
{
  "projects": [ "." ],
  "sdk": { "version": "1.0.0-preview2-1-003177" }
}
```

This would have the benefit of not requiring a change in project structure, but if you like to keep your source and test projects separate (I do), you can keep your main project in `src` and a test project in `test`, ensuring that `test` was added to the `projects` array in the `global.json` file. Either way should get the job done at the end of the day, so be sure to pick what makes most sense to you and your project.

If, like me, you have no idea which SDK your locally installed `dotnet` is using, running `dotnet --version` will give the exact string needed under `sdk.version` in your config. Once set up, you can commit all of those changes and push them up to your app, eventually seeing the below:

```
remote: ................................................
remote: Configuring the following project for use with IIS: 'D:\local\Temp\8d441b07923e5d0'
remote: Updating web.config at 'D:\local\Temp\8d441b07923e5d0\web.config'
remote: Configuring project completed successfully
remote: publish: Published to D:\local\Temp\8d441b07923e5d0
remote: Published 1/1 projects successfully
remote: KuduSync.NET from: 'D:\local\Temp\8d441b07923e5d0' to: 'D:\home\site\wwwroot'
remote: Deleting file: 'hostingstart.html'
remote: Copying file: 'appsettings.json'
remote: Copying file: 'Microsoft.AspNetCore.Antiforgery.dll'
remote: Copying file: 'Microsoft.AspNetCore.Authentication.Cookies.dll'
remote: Copying file: 'Microsoft.AspNetCore.Authentication.dll'
remote: Copying file: 'Microsoft.AspNetCore.Authorization.dll'
remote: Copying file: 'Microsoft.AspNetCore.Cors.dll'
remote: Copying file: 'Microsoft.AspNetCore.Cryptography.Internal.dll'
remote: Copying file: 'Microsoft.AspNetCore.Cryptography.KeyDerivation.dll'
remote: Copying file: 'Microsoft.AspNetCore.DataProtection.Abstractions.dll'
remote: Copying file: 'Microsoft.AspNetCore.DataProtection.dll'
remote: Copying file: 'Microsoft.AspNetCore.Diagnostics.Abstractions.dll'
remote: Copying file: 'Microsoft.AspNetCore.Diagnostics.dll'
remote: Copying file: 'Microsoft.AspNetCore.Diagnostics.EntityFrameworkCore.dll'
remote: Copying file: 'Microsoft.AspNetCore.Hosting.Abstractions.dll'
remote: Copying file: 'Microsoft.AspNetCore.Hosting.dll'
remote: Copying file: 'Microsoft.AspNetCore.Hosting.Server.Abstractions.dll'
remote: Copying file: 'Microsoft.AspNetCore.Html.Abstractions.dll'
remote: Copying file: 'Microsoft.AspNetCore.Http.Abstractions.dll'
remote: Copying file: 'Microsoft.AspNetCore.Http.dll'
remote: Copying file: 'Microsoft.AspNetCore.Http.Extensions.dll'
remote: Copying file: 'Microsoft.AspNetCore.Http.Features.dll'
remote: Copying file: 'Microsoft.AspNetCore.HttpOverrides.dll'
remote: Copying file: 'Microsoft.AspNetCore.Identity.dll'
remote: Copying file: 'Microsoft.AspNetCore.Identity.EntityFrameworkCore.dll'
remote: Copying file: 'Microsoft.AspNetCore.JsonPatch.dll'
remote: Copying file: 'Microsoft.AspNetCore.Localization.dll'
remote: Copying file: 'Microsoft.AspNetCore.Mvc.Abstractions.dll'
remote: Copying file: 'Microsoft.AspNetCore.Mvc.ApiExplorer.dll'
remote: Copying file: 'Microsoft.AspNetCore.Mvc.Core.dll'
remote: Copying file: 'Microsoft.AspNetCore.Mvc.Cors.dll'
remote: Copying file: 'Microsoft.AspNetCore.Mvc.DataAnnotations.dll'
remote: Copying file: 'Microsoft.AspNetCore.Mvc.dll'
remote: Copying file: 'Microsoft.AspNetCore.Mvc.Formatters.Json.dll'
remote: Copying file: 'Microsoft.AspNetCore.Mvc.Localization.dll'
remote: Copying file: 'Microsoft.AspNetCore.Mvc.Razor.dll'
remote: Copying file: 'Microsoft.AspNetCore.Mvc.Razor.Host.dll'
remote: Copying file: 'Microsoft.AspNetCore.Mvc.TagHelpers.dll'
remote: Copying file: 'Microsoft.AspNetCore.Mvc.ViewFeatures.dll'
remote: Copying file: 'Microsoft.AspNetCore.Razor.dll'
remote: Copying file: 'Microsoft.AspNetCore.Razor.Runtime.dll'
remote: Copying file: 'Microsoft.AspNetCore.Routing.Abstractions.dll'
remote: Copying file: 'Microsoft.AspNetCore.Routing.dll'
remote: Copying file: 'Microsoft.AspNetCore.Server.IISIntegration.dll'
remote: Copying file: 'Microsoft.AspNetCore.Server.Kestrel.dll'
remote: Copying file: 'Microsoft.AspNetCore.StaticFiles.dll'
remote: Copying file: 'Microsoft.AspNetCore.WebUtilities.dll'
remote: Copying file: 'Microsoft.Data.Sqlite.dll'
remote: Copying file: 'Microsoft.DotNet.InternalAbstractions.dll'
remote: Omitting next output lines...
remote: ...
remote: Finished successfully.
remote: Running post deployment command(s)...
remote: Deployment successful.
To https://slogsdon-projectname.scm.azurewebsites.net:443/slogsdon-projectname.git
   d26cae1..3b90ee9  master -> master
```

## Reap benefits

Once in Azure, your application becomes accessible to all with the URL:

```
$ curl -I http://slogsdon-projectname.azurewebsites.net
HTTP/1.1 200 OK
Content-Length: 0
Content-Type: text/html; charset=utf-8
Server: Microsoft-IIS/8.0
X-Powered-By: ASP.NET
Set-Cookie: ARRAffinity=95a49b67d4a8988dc9af99afd3e5e3d0f060d6764e52202b8294a0e6c7c97d6a;Path=/;Domain=slogsdon-projectname.azurewebsites.net
Date: Sat, 21 Jan 2017 04:16:05 GMT
```

{% img w-100 /assets/images/asp-dotnet-core-webapi-in-azure-app-service/visit-project.png %}

And don't forget about some of the benefits of using Azure (subscription and configuration allowing):

- Managed SQL Server
- CI/CD through VSTS
- Automatic scaling
- Application Insights
- etc.

So iterate on your project, incorporating Azure features when you see fit. Your release process can now be a simple `git push` away thanks to Azure App Service!
