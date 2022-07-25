const Vouches: Vouch[] = [
    {
        owner: {
            hash: "621565b031cc560012417e8d",
            location: "LU",
            name: "Colin Pucz",
            picture: true,
        },
        title: "I've been using Restorecord for a while...",
        description: "I've been using Restorecord for a while now and it has saved my butt so many times, just being able to get my members back is such a relief to me. Since then, I've stopped worrying all night waking up to my server being terminated. 🙏        ",
        stars: 5,
    },
    {
        owner: {
            hash: "621f58afd1a8dc001289dcff",
            location: "DE",
            name: "Aci",
            picture: false,
        },
        title: "It pulls members fast",
        description: "It pulls members fast, I mean for 10€ a year it's worth!",
        stars: 5,
    },
    {
        owner: {
            hash: "62205ecafd05820013406dd9",
            location: "HU",
            name: "ZsoZso",
            picture: false,
        },
        title: "Perfect uptime, support and features.",
        description: "Perfect uptime, support and features.\nI've been using Restorecord since almost two months, it is working totally fine and the support is faster then light\nReally recommending it",
        stars: 5,
    },
    {
        owner: {
            hash: "60a8c60bafc0ea001c0e1998",
            location: "DE",
            name: "Syx Syx",
            picture: false,
        },
        title: "uhq restore bot",
        stars: 5,
    },
    {
        owner: {
            hash: "61ec5fe999fb440012f201f9",
            location: "US",
            name: "Crafter",
            picture: false,
        },
        title: "Worked as intended!",
        stars: 5,
    },
    {
        owner: {
            hash: "622e396e1fa4c80012a6d554",
            location: "FR",
            name: "Leska",
            picture: true,
        },
        title: "BEST BOT",
        description: "Nice, fast support, working very well, very good bot",
        stars: 5,
    },
    {
        owner: {
            hash: "623a01561f97450012daa8c9",
            location: "US",
            name: "Daniel Miller",
            picture: false,
        },
        title: "This is the best $hit let me tell you...",
        description: "This is the best $hit let me tell you has saved my ass countless times no review I could leave on this trust pilot bull$hitz could describe how Amazing this damn bot is NONE! Its like one sec discord takes everything from you then boom its back!",
        stars: 5
    },
    {
        owner: {
            hash: "6240606869f17900122ca486",
            location: "UA",
            name: "KnownAsFigi",
            picture: false,
        },
        title: "I am figi#6969 | Review",
        description: "I am figi#6969 by the way and I am willing to share my experience within the bot and their staff team. The Current Owner of RestoreCord is very humble, Xenos and Bl4ckBl1zZ advised me and helped me out so much that they left me satisfied for sure. They have support team members which respond, If they don't even respond instantly that doesn't mean that the world is going to end. We are all humans and we might be busy. Anyways, as I was saying they assisted me and satisfied me with their service, they helped me on setting up the bot and their admin Bl4ckBl1zZ even helped me on another bot that wasn't related to them. I admire this service and I can't imagine anyone saying anything bad about this, this bot restores your \"server members\", like which bot does that? The answer is RestoreCord! Anyways when did I subscribe to Discord Premium? Because RestoreCord feels like a pure future.\n----------\nShort Description: RestoreCord is: trustworthy, smooth, fast, high quality, and really easy to use.",
        stars: 5,
    },
    {
        owner: {
            hash: "6265b7b0a8f44a00123f4c7f",
            location: "ES",
            name: "Xorax Yt",
            picture: false,
        },
        title: "Best 12$ ever spent",
        description: "Best bot ever I get a very big discord network with it thanks Xenos best bot",
        stars: 5,
    },
    {
        owner: {
            hash: "62db3d9e5f8ab200145a3d93",
            location: "DK",
            name: "Katy",
            picture: true,
        },
        title: "Honest review",
        description: "I've been using restorecord for almost a year now, my server kept getting banned so I tried for find a solution i looked around YouTube and found a video about the restorecord bot. It looked legit so I added it to my server set it up and it was working perfectly then around February this year the previous owner of restorecord has sold it to the new one because of some university stuff I think they'll new owner added stuff quickly from one month to another they added blacklist, linked guilds, unlink, send verify message and changed the website. It was going good and running better than ever then they hit 1 million members in less than a few months crazy but then it hit, the bot went down, the server was gone. What happened? No announcement, people thought they exit scammed or deleted everything, but no the bot has apparently been hit by a ban wave that's what they said so I waited and waited and then after a week they told us to join the telegram and there they said the bot got banned and they're talking to discord support to get it unbanned which took long so after about a month they told us they will be adding custom bots and more features the update would be done in June or July on Sunday but it just got delayed and delayed so I quickly switched to another bot le***.me but it only pulled a few members from all so I didn't use anything for a while but then after almost two and a half months restorecord is back I immediately upgraded to business plan so I can test all features and it's GREAT! The new bots a very good and it gets all my members which is beautiful the although last few months have been hard the new restorecord update is literally the best, the site has almost instant loading speeds and the redesign also looks good they're adding features almost every day now which I really really like I can recommend this bot to anyone looking for a good backup bot        ",
        stars: 5,
    },
    {
        owner: {
            hash: "62db45975f8ab200145a408e",
            location: "RS",
            name: "RidaYT",
            picture: false,
        },
        title: "Slow speeds",
        description: "Good service but slow speeds on member",
        stars: 4,
    }
]



interface Vouch {
    owner: TPOwner,
    title: string;
    description?: string;
    stars: number;
}

interface TPOwner {
    name: string;
    hash: string;
    location: string;
    picture?: boolean;
}

export default Vouches as Vouch[];
