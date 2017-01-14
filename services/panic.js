module.exports = {
  floats: [
    {
      title: 'Is everything down?',
      created_at: +new Date - 1000 * 60 * 35,
      user: {
        name: 'Yep',
        avatar_url: 'https://placekitten.com/640/640',
      },
      attending: false,
    },
    {
      title: 'Still?',
      created_at: +new Date - 1000 * 60 * 120,
      user: {
        name: 'Wow',
        avatar_url: 'https://placekitten.com/640/640',
      },
      attending: true,
    },
  ],

  myFloats: [
    {
      title: "hmm, mewbe I should work for this app",
      created_at: +new Date - 1000 * 60 * 60,
      user: {
        avatar_url: 'https://placekitten.com/640/640',
        name: 'You',
      },
      attendees: [
        {
          avatar_url: 'https://placekitten.com/640/640',
          name: "You kitten me?",
          joined_at: +new Date,
        },
        {
          avatar_url: 'https://placekitten.com/640/640',
          name: "This is a catastrophe.",
          joined_at: +new Date,
        },
      ]
    }
  ],

  friends: [
    { id: 'PANICMODE1', name: "Oops", avatar_url: "https://placekitten.com/640/640"},
    { id: 'PANICMODE2', name: "Server's down.", avatar_url: "https://placekitten.com/640/640"},
    { id: 'PANICMODE3', name: "Work here?", avatar_url: "https://placekitten.com/640/640"},
  ],
}
