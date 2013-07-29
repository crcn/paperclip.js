class CssAttrBinding extends require("./base")

  ###
  ###
  
  _onChange: (classes) => 

    classesToUse = @node.getAttribute("class")?.split(" ") or []


    for className of classes
      useClass = classes[className]
      i = classesToUse.indexOf(className)

      if useClass
          unless ~i
            classesToUse.push className
      else if ~i
        classesToUse.splice i, 1



    @node.setAttribute "class", classesToUse.join " "


module.exports = CssAttrBinding