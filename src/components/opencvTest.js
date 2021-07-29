
import Button from  'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import React, {useState, useEffect} from 'react' 
import image_1 from "../assets/forthesecrit.jpg"
var cv = require('opencv.js')

var metaContainerStyle = {
    gridTemplateColumns: "auto auto",
    display: "grid"
}

var myStyleImage = {
    display: "none"
}

var TitleStyle = {
    color: "black"
}

var containerStyle = {
    width: "300px",
    height: "300px",
    overflowY: "auto",
    overflowX: "auto"
}

var myStyleInput = {
    padding: 0,
    margin: 0
}

var inputSizeStyle = {
    width: "300px",
    marginTop: "10px"
}

function fromCanvasToMat(canvas_id){

    let canvas1 = document.getElementById(canvas_id)
    let ctx = canvas1.getContext('2d')
    let imgData = ctx.getImageData(0,0,canvas1.width,canvas1.height)
    let src = cv.matFromImageData(imgData)
    return src
}

function filterConvolution(src,filter=[-0.5,-0.5,-0.5,-0.5,4.3,-0.5,-0.5,-0.5,-0.5]){

    let dst = new cv.Mat()

    let M = cv.matFromArray(Math.sqrt(filter.length), Math.sqrt(filter.length), cv.CV_32FC1, filter)
    let anchor = new cv.Point(-1,-1)
    let dst2 = new cv.Mat()

    cv.cvtColor(src, dst2, cv.COLOR_RGBA2GRAY,0) 
    cv.filter2D(dst2,dst, cv.CV_8U, M, anchor, 0, cv.BORDER_DEFAULT)
    M.delete(); dst2.delete();

    return dst
}

function drawFilterImage(input_canvas_id, output_canvas_id, filterMatrix){
    let src = fromCanvasToMat(input_canvas_id)
    let testHull = filterConvolution(src, filterMatrix['data'])
    cv.imshow(output_canvas_id, testHull)

}

function fromImageToCanvas(image_id,canvas_id){
    var canvas = document.getElementById(canvas_id)
    var context = canvas.getContext('2d');
    var img = document.getElementById(image_id)
    canvas.width = img.width;
    canvas.height = img.height;
    context.drawImage(img,0,0);


}

function funca(e,value){

    value["array"]["data"][value["position"]] = parseFloat(e.target.value)
    value["handler"]({data: value["array"]["data"], size:value["array"]["size"]})

}

function handleEvent(passedInElement){

    return function(e) {
        funca(e, passedInElement)
    }
}

function addPerturbation(array, step_size){
    for (var i = 0; i<array.length; i++){
        array[i] = array[i] + (Math.random()-Math.random())*step_size
    }

    return array
}

var changing_func = {}

function OpenCV({canvas_id}){

    const [filterMatrix, setFilterMatrix] = useState({data: [-0.5,-0.5,-0.5,-0.5,4.3,-0.5,-0.5,-0.5,-0.5],size:3})
    const [gridStyle, setGridStyle] = useState({width:"100%",height:"100%", gridTemplateColumns:"auto auto auto", display:"grid"})
    const [inputStyle, setInputStyle] = useState({width: "100%",height:"100%", textAlign:"center", fontSize:"24px"})
    const [buttonStyleStart, setButtonStyleStart] = useState({display:""})
    const [buttonStyleStop, setButtonStyleStop] = useState({display:"none"})
        
    
    var image_id = 'image1' + canvas_id; var input_canvas_id = "canvasInputId" + canvas_id; var output_canvas_id = "canvasOutputId" + canvas_id;
    var rows = createMatrixTable(filterMatrix,setFilterMatrix)

    function onLoad(){
        fromImageToCanvas(image_id,input_canvas_id)
        setFilterMatrix({data: [-0.5,-0.5,-0.5,-0.5,4.3,-0.5,-0.5,-0.5,-0.5],size:3})
        
    }

    function createMatrixTable(filterMatrix,setFilterMatrix){
        let cell = []
        console.log(filterMatrix)
        for (var i = 0; i < Math.sqrt(filterMatrix["data"].length); i++){
            for (var idx = 0; idx< Math.sqrt(filterMatrix["data"].length); idx++){
                let cellID = `cell${i}-${idx}`
                cell.push(<div style = {myStyleInput} key = {cellID} id = {cellID}>
                           <input
                             value = {filterMatrix["data"][i*Math.sqrt(filterMatrix["data"].length)+idx]}
                             type = "number"
                             style= {inputStyle}
                             onChange = {handleEvent({position: i*Math.sqrt(filterMatrix["data"].length)+idx, handler: setFilterMatrix, array: filterMatrix})}
                           />
                          </div>                
                    )
            }
        }
        return cell
    }

    function StartRandomMatrix(){

        setButtonStyleStart({display:"none"})
        setButtonStyleStop({display:""})
        changing_func[canvas_id+""] = setInterval(function(){
            var size_squared = filterMatrix.size*filterMatrix.size
            var random_array = addPerturbation(filterMatrix.data,0.1)
            var sum_of_elements = random_array.reduce((a,b)=> a+b,0)
            var little_piece_to_add = 0//sum_of_elements/(size_squared+0.001)
            var new_random_array = random_array.map(
                function(e){
                    e = e-little_piece_to_add
                    return e
                }
            )
            setFilterMatrix({data: new_random_array,size:filterMatrix.size})
        }, 300)
    }

    function StopRandomMatrix(){
        setButtonStyleStart({display:""})
        setButtonStyleStop({display:"none"})        
        clearInterval(changing_func[canvas_id+""])
    }


    const onChangeHandler = event => {
        StopRandomMatrix()
        var arr = []
        var word_to_repeat = "auto "
        setGridStyle({width:"100%",height:"100%",display:"grid",gridTemplateColumns:`${word_to_repeat.repeat(event.target.value)}`})
        setInputStyle({width:"100%",height:"100%",textAlign: "center",fontSize:parseInt(24*3/(event.target.value))}) 
        
        for (var i = 0; i< event.target.value*event.target.value; i++){
            arr.push(0)
        }

        setFilterMatrix({data:arr, size:event.target.value})

    }

    useEffect(
        () => {

            drawFilterImage(input_canvas_id,output_canvas_id,filterMatrix) 

        }
        , [filterMatrix],
    )

return (
    <div>
        <img id={image_id} src={image_1} onLoad={onLoad} style={myStyleImage}/>
        <div style={metaContainerStyle}>
            <div>
              <Card style = {{ width: '22rem'}}>
                  <canvas id={input_canvas_id}></canvas>
                  <Card.Body>
                      <div style={containerStyle}>
                        <div style={gridStyle}>
                        {rows}
                        </div>
                      </div>
                      <input
                      style = {inputSizeStyle}
                      type = "number"
                      name = "name"
                      min = "2"
                      onChange = {onChangeHandler}
                      value = {filterMatrix["size"]}
                      />
                  </Card.Body>
              </Card>
            </div>
            <div>
              <Card style = {{ width: '22rem', height: '100%'}}>
                  <canvas id={output_canvas_id}></canvas>
                  <Card.Body>
                    <Card.Title style={TitleStyle}>Convolutional Filter</Card.Title>
                    <Card.Text style={TitleStyle}>
                        Some quick example of convolution between a matrix and an image.
                    </Card.Text>
                    <Button
                      style = {buttonStyleStart}
                      onClick = {StartRandomMatrix}
                    >
                        Start Random Matrix
                    </Button>
                    <Button
                      style = {buttonStyleStop}
                      onClick = {StopRandomMatrix}
                    >
                        Stop Random Matrix
                    </Button>
                  </Card.Body>
              </Card>
            </div>
        </div>
    </div>
)


}


export default OpenCV;