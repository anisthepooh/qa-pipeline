onRecordCreate((e) => {
  const records = e.app.findRecordsByFilter("projects", "1=1", "-color", 1, 0)
  const maxColor = records.length > 0 ? records[0].getInt("color") : -1
  e.record.set("color", maxColor + 1)
  e.next()
}, "projects")
