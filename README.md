# Catapult Mailer: Launch Your Emails Like a Pro 

**Catapult Mailer** is your one-stop shop for sending **eye-catching and impactful newsletters**.  Imagine a **flaming arrow** piercing through inboxes, delivering your message with **speed and precision**. That's the power of Catapult Mailer!

**What can you do with Catapult Mailer?**

 * ~~**Effortlessly design** beautiful and engaging newsletters with our intuitive drag-and-drop editor.~~
* ~~**Target your audience** with laser focus using our powerful segmentation tools.~~
* ~~**Spark curiosity** with fiery subject lines that get your emails opened.~~
* ~~**Track your results** and see how your campaigns are performing with detailed analytics.~~
* ~~**Schedule your sends** for optimal delivery times and maximize engagement.~~

Ummmm... seems I may have used a little gemini to write the readme :shushing_face:  

Well besides gemini introductions you can find a simple astro site that interfaces with [kcoderhtml/cloudflare-email](https://github.com/kcoderhtml/cloudflare-email) on the backend and is easily deployable with netlify!

## Setup
1. Fork this repo and deploy it to netlify
2. create a new Astro DB project at [studio.astro.build](https://studio.astro.build/) and generate a new app token to be added to the netlify env below
3. Enable Web Vitals in the new Astro DB you just created.
4. create a new slack app with the app manifest listed below; make sure to change the name of the app and to install it into your workspace:
```yaml
display_information:
  name: Catapult Mailer - {name} Instance # can be whatever this is just what I use
  description: The OAuth Provider for the {name} Catapult Mailer instance # same here
  background_color: "#735bb5" # could be whatever you want
oauth_config:
  redirect_urls:
    - https://your-app-here.netlify.app/
  scopes:
    user:
      - openid
      - email
      - profile
settings:
  org_deploy_enabled: false
  socket_mode_enabled: false
  token_rotation_enabled: false
```
5. setup the ENV in netlify:
```s
ARCJET_KEY=ajkey_xxxxxxxxxxxxxxxxxxxxxxxxxx {you can get this from https://arcjet.com/}
ASTRO_STUDIO_APP_TOKEN=d478xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx:gbaixxxxxxxxxxxxxxxxxxxxxxxx:gbaixxxxxxxxxxxxxxxxxxxxxxxx {you can get this from your astro db project}
EMAIL_API=https://email.example.com/api/email {change it to be your cloudflare email instance but always add the /api/email on the end of your base domain}
EMAIL_API_KEY={Whatever you set it to be in your cloudflare email instance}
JWT_SECRET={generate a new 256 length secret at https://jwtsecret.com/generate or with `openssl rand -hex 256`}
NAME=Catapult Mailer dev instance
SEND_EMAIL=sendingemai@example.com
SLACK_CLIENT_ID=xxxxxxxxxx.xxxxxxxxxxxxx
SLACK_CLIENT_SECRET=55f7xxxxxxxxxxxxxxxxxxxxxxxxxxxx
SLACK_SIGNING_SECRET=d597xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
6. Clone the forked repository and run `bun install` then `bun astro db login && bun astro db link && bun astro db push` to init the remote database
7. Once the netlify site has been built and deployed succesfully then go to the Astro DB you created and add your admin users to the db in the `ADMINS` table:
![Screenshot of Astro DB ADMINS Table](/.github/images/admins-table.png)
8. Have fun!

## Integration && Use
The api is very simple to subscribe someone to the newsletter then simply make a post request to your site at /api/subscribe and include the name and email via a json body e.g
```sh
curl -X POST -H "Content-Type: application/json" -d '{"email": "example@gmail.com", "name": "Example User"}' https://your-app-here.netlify.app/
```
or as a fetch
```js
fetch('https://your-app-here.netlify.app/api/subscribe', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ email: 'example@gmail.com', name: 'Example User' }),
})
```

**Ready to take your email marketing to the next level? Grab your flaming arrows and let Catapult Mailer launch your success!**

P.S. This repo is licensed with the AGPL-3.0 license which can be found in [LICENSE.md](/LICENSE.md)