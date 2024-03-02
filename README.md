# RestoreCord is lying to you, here's why

Hi script kiddies! Now RestoreCord is open source by the help of a few exploits and getting the owners personal github token.

Xenos (the owner), added the code for exfiltrating IPs for inf0sec with [direct references to it in the code](https://github.com/restorecord-oss/restorecord-new/blob/605fa7cf23d322c83882c4b39e2018f6fc7af7f2/pages/api/admin/members.ts#L86), along with Zebratic (the "owner" of inf0sec) [having commits far later then when he was "removed"](https://github.com/restorecord-oss/restorecord-new/commit/f2a050317378e5033ab68dc25f3ac3dd56f0bcc8)..

Recall, Xenos was made aware about Zebratic's behaviour and infosec during December 22nd. Why would he still have permission to commit to the repo after he was outed for selling user data? Well as stated before, Xenos was in on it the whole time. He made the commit to add exfiltrating userdata for inf0sec.

[The code where inf0sec would display fake IPs if it was not found in the restorecord database was also here](https://github.com/restorecord-oss/restorecord-new/blob/605fa7cf23d322c83882c4b39e2018f6fc7af7f2/pages/api/admin/members.ts#L145), along with a [whitelist to make 3 people (xenos, blackblitz, and zebratic) not get IP logged](https://github.com/restorecord-oss/restorecord-new/blob/605fa7cf23d322c83882c4b39e2018f6fc7af7f2/pages/api/callback.ts#L11).

## Its just a vuln!

The RestoreCord developers and admins tried throwing this off as just a small vulnerability only affecting some people, but in the codebase. You'll notice that this is a total lie, and it was incredibly intentional.

![Bl4ckBl1zZ (an admin) saying that this was a small vulnerability](https://i.imgur.com/Nc9rG4j.png)


If you look at the commit where the owner added the endpoint to add exfiltrating endpoint, [you'll also see a API key endpoint added](https://github.com/restorecord-oss/restorecord-new/commit/40fb73041b4c6b61a1fc09ccd30592a5d283e610#diff-4adf638d164b71da2e07123e332dcc1b6b25375f123254056f19125ba61d1ba1R35) at the same time, just for admins. (wonder what thats used for...)

Conveniently, the domain inf0sec.net, was registered on the same day the API was created, December 14th 2023: https://web.archive.org/web/20240302004557/https://www.whois.com/whois/inf0sec.net

## Free premium for everyone!

To celebrate going open source, we are giving premium away to everyone using [the hardcoded coinbase secret](https://github.com/restorecord-oss/restorecord-new/blob/cb84ce666f3c88533495414a758d11ec4ea8b797/pages/api/coinbase/webhook.ts#L28) left in the source code!

This would have been admin, but due to their incompetence of not having CI, we couldn't get something get that gets their database (their incompetence is their best strength)

## Thank you

Thank you for being a valued RestoreCord customer, even more valued because we sold your IP.
