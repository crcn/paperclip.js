path = require "path"
pc   = require "../../../../browser"
fs   = require "fs"

class LayoutBlockBinding extends require("./base")

  ###
  ###

  _onChange: (value) ->

    tplPath  = value.path or value
    orgPath  = @context.get("path")

    realPath = path.join(path.dirname(orgPath), tplPath)

    tpl = pc.template fs.readFileSync realPath, "utf8"

    loader = tpl.bind({
      content: @contentTemplate.bind(@context).section.toFragment()
    })

    @section.replaceChildNodes loader.section.toFragment()






module.exports = LayoutBlockBinding