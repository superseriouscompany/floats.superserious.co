const user = {
  name: 'Foo Barbaz',
  avatar_url: 'https://placekitten.com/640/640'
}

module.exports = {
  float: {
    id: 'PANICMODE3',
    title: 'Halp',
    created_at: +new Date - 1000 * 60 * 35,
    user: user,
    attending: true,
    attendees: [{
      name: 'Someone',
      avatar_url: 'https://placekitten.com/640/640',
    }]
  },
  floats: [
    {
      id: 'PANICMODE3',
      title: 'Is everything down?',
      created_at: +new Date - 1000 * 60 * 35,
      user: user,
      attending: true,
      attendees: [{
        name: 'Someone',
        avatar_url: 'https://placekitten.com/640/640',
      }]
    },
    {
      id: 'PANICMODE4',
      title: 'Still?',
      created_at: +new Date - 1000 * 60 * 120,
      user: user,
      attending: true,
      attendees: [user]
    },
  ],

  myFloats: [
    {
      id: 'PANICMODE1',
      title: "hmm, mewbe I should work for this app",
      created_at: +new Date - 1000 * 60 * 60,
      user: user,
      invitees: ['PANICMODE1', 'PANICMODE2'],
      attendees: [user, user]
    },
    {
      id: 'PANICMODE5',
      title: 'nobody likes me',
      created_at: +new Date - 1000 * 60,
      user: user,
      invitees: ['PANICMODE1', 'PANICMODE3'],
      attendees: [user, user],
    }
  ],

  nearbyFriends: [
    { id: 'PANICMODE1', name: "Oops", avatar_url: "https://placekitten.com/640/640", distance: 1 },
    { id: 'PANICMODE2', name: "Server's down.", avatar_url: "https://placekitten.com/640/640", distance: 1.5 },
    { id: 'PANICMODE3', name: "Work here?", avatar_url: "https://placekitten.com/640/640", distance: 25 },
  ],

  friends: [
    { id: 'PANICMODE1', name: "Neil Sarkar", avatar_url: "https://placekitten.com/640/640"},
    { id: 'PANICMODE2', name: "Santiago Garza", avatar_url: "https://placekitten.com/640/640"},
    { id: 'PANICMODE3', name: "São Pão", avatar_url: "https://placekitten.com/640/640"},
    { id: 'PANICMODE4', name: "Trump", avatar_url: "https://placekitten.com/640/640", blocked: true },
  ],

  randos: [
    { id: 'PANICMODE1', name: "Randy Rando", avatar_url: "https://placekitten.com/640/640", distance: 1 },
    { id: 'PANICMODE2', name: "Steve Sketch", avatar_url: "https://placekitten.com/640/640", distance: 5 },
    { id: 'PANICMODE3', name: "Shirley Shady", avatar_url: "https://placekitten.com/640/640", distance: 49 },
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
      float_id: 'PANICMODE1',
      members: ['PANICMODE1', 'PANICMODE2', 'PANICMODE5'],
      users: [user, user, user],
      message: {
        id: 2,
        type: 'new_message',
        text: 'Hello World',
        created_at: +new Date,
        user: {
          id: 'PANICMODE1',
          name: 'Andrew Sauer',
          avatar_url: 'https://placekitten.com/640/640',
        }
      },
    },
    {
      id: 'PANICMODE3',
      float_id: 'PANICMODE1',
      members: ['PANICMODE3', 'PANICMODE5'],
      users: [user, user, user],
      message: {
        id: 2,
        type: 'new_message',
        text: 'Goodbye',
        created_at: +new Date - 360000,
        user: {
          id: 'PANICMODE1',
          name: 'Neil Sarkar',
          avatar_url: 'https://placekitten.com/640/640',
        }
      },
    },
    {
      id: 'PANICMODE4',
      float_id: 'PANICMODE4',
      members: ['PANICMODE3', 'PANICMODE5'],
      users: [user, user],
      message: {
        id: 2,
        type: 'new_message',
        text: 'A message in someone else\'s float',
        created_at: +new Date - 360000,
        user: {
          id: 'PANICMODE1',
          name: 'Cheech Marin',
          avatar_url: 'https://placekitten.com/640/640',
        }
      },
    },
  ],

  messages: [
    {
      id: 2,
      float_id: 'PANICMODE1',
      convo_id: 'PANICMODE1',
      type: 'new_message',
      text: 'Hello World',
      created_at: +new Date,
      user: {
        id: 'PANICMODE1',
        name: 'Bright Optimism',
        avatar_url: 'https://placekitten.com/640/640',
      }
    },
    {
      id: 1,
      float_id: 'PANICMODE1',
      convo_id: 'PANICMODE1',
      type: 'new_message',
      text: 'Goodbye, Cruel World',
      created_at: +new Date,
      user: {
        id: 'PANICMODE2',
        name: 'Real Life',
        avatar_url: 'https://placekitten.com/640/640',
      }
    },
  ],
}
