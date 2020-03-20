module.exports = [
  {
    name: "subject",
    value: "We Received your Message"
  },
  {
    name: "variables",
    children: [
      {
        name: "firstName",
        value: ["user", "firstName"]
      }
    ]
  },
  {
    name: "email",
    value: ["user", "email"]
  },
  {
    name: "template",
    value: "userContact.ejs"
  }
];
