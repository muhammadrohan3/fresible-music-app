module.exports = [
  {
    name: "subject",
    value: "Your Subscription has been Activated"
  },
  {
    name: "variables",
    children: [
      {
        name: "firstName",
        value: ["schemaResult", "user", "firstName"]
      },
      {
        name: "url",
        value: ["url"]
      }
    ]
  },
  {
    name: "email",
    value: ["schemaResult", "user", "email"]
  },
  {
    name: "template",
    value: "subscriptionActivated.ejs"
  }
];
