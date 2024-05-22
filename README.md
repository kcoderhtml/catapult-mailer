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
2. create a new Astro DB project at [studio.astro.build](https://studio.astro.build/)
3. create a new slack app with the app manifest listed below; make sure to change the name of the app and to install it into your workspace:
```yaml
display_information:
  name: Catapult Mailer - PB Instance
oauth_config:
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
4. setup the ENV in netlify:
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

**Ready to take your email marketing to the next level? Grab your flaming arrows and let Catapult Mailer launch your success!**

P.S. This repo is licensed with the AGPL-3.0 license which can be found in [LICENSE.md](/LICENSE.md)