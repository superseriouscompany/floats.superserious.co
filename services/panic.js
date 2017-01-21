module.exports = {
  floats: [
    {
      id: 'PANICMODE1',
      title: 'Is everything down?',
      created_at: +new Date - 1000 * 60 * 35,
      user: {
        name: 'Yep',
        avatar_url: 'https://placekitten.com/640/640',
      },
      attending: false,
    },
    {
      id: 'PANICMODE2',
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
      id: 'PANICMODE1',
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

  nearbyFriends: [
    { id: 'PANICMODE1', name: "Oops", avatar_url: "https://placekitten.com/640/640"},
    { id: 'PANICMODE2', name: "Server's down.", avatar_url: "https://placekitten.com/640/640"},
    { id: 'PANICMODE3', name: "Work here?", avatar_url: "https://placekitten.com/640/640"},
  ],

  friends: [
    { id: 'PANICMODE1', name: "Neil Sarkar", avatar_url: "https://placekitten.com/640/640"},
    { id: 'PANICMODE2', name: "Santiago Garza", avatar_url: "https://placekitten.com/640/640"},
    { id: 'PANICMODE3', name: "São Pão", avatar_url: "https://placekitten.com/640/640"},
    { id: 'PANICMODE4', name: "Trump", avatar_url: "https://placekitten.com/640/640", blocked: true },
  ],

  randos: [
    { id: 'PANICMODE1', name: "Randy Rando", avatar_url: "https://placekitten.com/640/640" },
    { id: 'PANICMODE2', name: "Steve Sketch", avatar_url: "https://placekitten.com/640/640" },
    { id: 'PANICMODE3', name: "Shirley Shady", avatar_url: "https://placekitten.com/640/640" },
  ],

  friendRequests: [
    { id: 'PANICMODE1', name: "Chris Chameleon", avatar_url: "https://placekitten.com/640/640"},
    { id: 'PANICMODE2', name: "Frank Ferret", avatar_url: "https://placekitten.com/640/640"},
    { id: 'PANICMODE3', name: "Hank Hippo", avatar_url: "https://placekitten.com/640/640"},
  ],

  user: {
    id: 'PANICMODE1',
    name: "Darlene Down",
    avatar_url: "https://placekitten.com/640/640",
  },

  convos: [
    {
      id: 'PANICMODE1',
      name: 'Death and Taxes',
      float_id: 'PANICMODE1',
      members: ['PANICMODE1', 'PANICMODE2'],
      last_message_at: +new Date,
      last_message_text: 'Oh no'
    },
  ],
}
