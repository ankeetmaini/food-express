# Realtime Tracking on Google

In this tutorial we'll create an awesome app to track realtime location of our friends!

## Step 0: Setting up our app
- Start of by creating our `index.html` with this code snippet.
- Our humble [`index.html`](https://link.to.github) doesn't do much except including a `meta` tag in the `head` section so that our app looks and works well in mobile browsers as well and includes a JavaScript file in `src` directory.

```html
<!DOCTYPE html>
<html>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <head>
    <title>Realtime Tracking with Pusher</title>
    <meta charset="utf-8">
  </head>
  <body>
    <h1>Let's start tracking!</h1>
    <script type="text/javascript" src="src/app.js"></script>
  </body>
</html>
```
- Since we'll be using [Google Maps](https://maps.google.com/), let's add their [JavaScript API](https://developers.google.com/maps/documentation/javascript/) and see the map in action!
