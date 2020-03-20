module.exports = [
  {
    name: "subject",
    value: "You are welcome!"
  },
  {
    name: "variables",
    children: [
      {
        name: "firstName",
        value: ["schemaResult", "firstName"]
      }
    ]
  },
  {
    name: "email",
    value: ["schemaResult", "email"]
  },
  {
    name: "template",
    value: "welcome.ejs"
  }
];
