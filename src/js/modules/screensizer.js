export default function screensizer() {

    var width = document.documentElement.clientWidth

    var height = document.documentElement.clientHeight

    return (width < height) ? width : height ;
     
}