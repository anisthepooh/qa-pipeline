onRecordBeforeCreateRequest((e) => {
  const records = $app.dao().findRecordsByFilter(
    "projects",
    "1=1",
    "-color",
    1,
    0
  )

  const nextColor = records.length > 0 ? records[0].getInt("color") + 1 : 1
  e.record.set("color", nextColor)
}, "projects")
