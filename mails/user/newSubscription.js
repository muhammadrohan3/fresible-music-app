module.exports = [
  {
    name: "subject",
    value: "You Just Subscribed to a Package"
  },
  {
    name: "variables",
    children: [
      {
        name: "firstName",
        value: ["user", "firstName"]
      },
      {
        name: "url",
        value: ["url"]
      }
    ]
  },
  {
    name: "email",
    value: ["user", "email"]
  },
  {
    name: "template",
    value: "newSubscription.ejs"
  }
];
