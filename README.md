# Threejs svg parser

This repo to spot some edge cases not handle from [SvgLoader](https://threejs.org/docs/#examples/en/loaders/SVGLoader).

[screenshoot](./public/screenshoot.jpg)

On complex and big SVG files (>20Mb), SvgLoader give some undesired results. It concerne path elements as I can tell. Possible investigation for the fix/improvment:

-   SvgLoader parse function
-   Clockwise/counterclockwise issue
-   Wrong "d" attributes from the svg path element

The files in ./public folder isolate some parts of complex SVG file who produce those results. Some of the SVG files in the repo are optimised with the library [svgo](https://www.npmjs.com/package/svgo) with those plugins :

-   removeDoctype
-   removeXMLProcInst
-   removeComments
-   removeMetadata
-   removeEditorsNSData
-   cleanupAttrs
-   mergeStyles
-   inlineStyles
-   minifyStyles
-   cleanupIds
-   removeUselessDefs
-   convertColors
-   removeUnknownsAndDefaults
-   removeNonInheritableGroupAttrs
-   removeUselessStrokeAndFill
-   cleanupEnableBackground
-   removeHiddenElems
-   removeEmptyText
-   collapseGroups
-   convertPathData
-   convertTransform
-   removeEmptyAttrs
-   removeEmptyContainers
-   removeUnusedNS
-   sortAttrs
-   sortDefsChildren
-   removeTitle
-   removeDesc

## scripts

```
npm i
npm run dev
```
