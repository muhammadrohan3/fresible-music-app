module.exports = [
  {
    name: "subject",
    value: "You Just Submitted a Release"
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
    value: "newSubmission.ejs"
  }
];
