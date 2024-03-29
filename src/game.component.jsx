import { useState, useEffect } from "react";
import InputComponents from "./components/input-components/input-components";
import Header from "./header";
import RightDivPanel from "./components/right.component/right-div-panel.component";
import MiddleDivPanel from "./components/middle.component/middle-div-panel";
import Reset from "./components/reset.component/reset.component";
import WhoIsNext from "./components/who-is-next.component/who-is-next.component";
import {useSelector, useDispatch} from 'react-redux';
import { onChangeRow, onChangeColoum, onChangeWinnerRatio, onChangeOColor, onChangeXColor } from "./redux/game-state/gameSlice";




function Game() {


    const  dispatch = useDispatch()
    const {rows, coloums, winnerRatio, xColor, oColor} = useSelector((state) => state.game)

    const [matrix, setMatrix] = useState(Array.from(Array(rows), () => new Array(coloums).fill(null)))
    const [isXNext, setIsXNext] = useState(true)
    const [winner, setWinner] = useState("")
    const [play , setPlay] = useState(true);
    const [history, setHistory] = useState([])
    const [stepNumber, setStepNumber] = useState(0);
    const [matMove, setMatMove] = useState(0);

    useEffect(() => {
        setMatrix(Array.from(Array(rows), () => new Array(coloums).fill(null)))
        setHistory([Array.from(Array(rows), () => new Array(coloums).fill(null))])
        matrixSetup()
        setWinner("")
        setPlay(true)
        setIsXNext(true)
    }, [rows, coloums, winnerRatio])


        //changing matrix size
    const handleChange = (e) =>{

        //console.log(history)

        let change = e.target.value;
        if(change < 3)
          change=3;


        if(e.target.name === "row")
          dispatch(onChangeRow(Number(change)))
        else
          dispatch(onChangeColoum(Number(change)))


        setIsXNext(true)
        setPlay(true)
        setWinner("")
        // console.log(history)
    }

    const horizontalCheck = (rowIndex, colIndex) =>{
      
      for(let i=0; i<coloums; ++i){
        let check = 0;

        for(let j=i; j<coloums; ++j){
          if(matrix[rowIndex][j]===matrix[rowIndex][colIndex])
            check+=1;
          else
            break;
        }

        if(check>=winnerRatio)
          return true;
      }

      return false;
    } 

    const verticalCheck = (rowIndex, colIndex) =>{
      
      for(let i=0; i<rows; ++i){
        let check = 0;

        for(let j=i; j<rows; ++j){
          if(matrix[j][colIndex] == matrix[rowIndex][colIndex])
            check+=1;
          else
            break;
        }

        if(check>=winnerRatio)
            return true;
      }

      return false;
    }

    const diagonalTopToBottomCheck = (rowIndex, colIndex) =>{
      

      // console.log("In check diagonal")
      let r, c;
      if(colIndex >= rowIndex){
        r=0;
        c=colIndex - rowIndex;
      }
      else{
        c=0;
        r=rowIndex-colIndex;
      }

      console.log("In check diagonal", r, c)

      for(let i=r, j=c; i<rows && j<coloums; ++i, ++j){
        let check = 0;

        
        for(let p=i, q=j; p<rows && q<coloums; ++p, ++q){

          // console.log(`Checking ${p} ${q}`)
          if(matrix[p][q] === matrix[rowIndex][colIndex])
            check+=1;
          else
            break;
        }

        if(check >= winnerRatio)
          return true;
      }

      return false;

    }

    const checkUp = (rowIndex, colIndex, check) => {

      
      if(rowIndex<0 || colIndex>=coloums || matrix[rowIndex][colIndex]!==check )
        return 0;
      
      //console.log(matrix[rowIndex][colIndex], rowIndex, colIndex)
      
      let x = checkUp(rowIndex-1, colIndex+1, check) + 1;

      return x;
    }

    const checkDown = (rowIndex, colIndex, check) => {

      if(rowIndex>=rows || colIndex<0 || matrix[rowIndex][colIndex]!==check )
        return 0;
      
      let x = checkDown(rowIndex+1, colIndex-1, check) + 1;

      return x;
    }

    const diagonalBottomToTopCheck = (rowIndex, colIndex) => {

      let up  = checkUp(rowIndex-1, colIndex+1, matrix[rowIndex][colIndex]);
      let down = checkDown(rowIndex+1, colIndex-1, matrix[rowIndex][colIndex]);

      // console.log("Up", up, "Down", down);
      if(up+down+1 >= winnerRatio)
        return true;

      console.log("Up", up)
      
      return false;
    }

    const checkWinner = (row, col, diagonalTB, diagonalBT, check) =>{


      if( row===true || col===true || diagonalTB===true || diagonalBT===true){
        setWinner(`Winner is ${check}`)
        setPlay(false);
      }

    }

    const dynamicWinner = (rowIndex, colIndex, check) => {

      
      const row = horizontalCheck(rowIndex, colIndex);
      const col = verticalCheck(rowIndex, colIndex);
      const diagonalTB = diagonalTopToBottomCheck(rowIndex, colIndex);
      const diagonalBT = diagonalBottomToTopCheck(rowIndex, colIndex);

      console.log( rowIndex, colIndex)

      checkWinner(row, col, diagonalTB, diagonalBT, check)
    }


    const calculateWinner = (rowIndex, colIndex) => {
      
      let row = false, col = false, diagonal = false;
      const check = matrix[rowIndex][colIndex];

      if(winnerRatio>1 && winnerRatio<=rows && winnerRatio<=coloums){
        dynamicWinner(rowIndex, colIndex, check);
        return;
      }


      
      
      
      //row check, changing columns
      for(let i = 0; i<coloums; ++i){
        if(matrix[rowIndex][i] !== check)
          break;
        if(i==coloums-1){
          row = true;
        }
      }
      

      //column check, chaning row
      for(let i = 0; i<rows; ++i){
        if(matrix[i][colIndex] !== check)
          break;
        if(i==rows-1){
          col = true;
        }
      }

      //diagonal check from 0,0 to n,n
      if(rowIndex===colIndex){
        for(let i=0, j=0; i<rows && j<coloums; ++i, ++j){
          if(matrix[i][j]!==check)
            break;
          if(i==rows-1 && j==coloums-1)
            diagonal = true;
        }
      }

      //diagonal check from n,0 to 0,n
      for(let i=rows-1, j=0;  i>=0 && j<coloums; --i, ++j){

        if(matrix[i][j]!==check)
          break;
        if(i==0 && j==rows-1)
          diagonal = true;
      }


      // console.log(row, col, diagonal, check)
      
      //deciding winner
      checkWinner(row, col, diagonal, false, check)

    }



    //Adding History to history with shallow copy of matrix
    const matrixSetup = () =>{

      const newMatrix = []
      matrix.map( (x) => {
          newMatrix.push(x.slice())
      })


      history.push(newMatrix)
    } 



    //assigning square required value and deleting history
    const handleClick = (rowIndex, i) =>{

        if(matMove < history.length){
          while(matMove < history.length){
            history.pop()
          }

          matrixSetup()
        }

        

        if(play && !matrix[rowIndex][i]){
          if(isXNext){
            matrix[rowIndex][i]="X"
            setIsXNext(false)
          }
            
          else{
            matrix[rowIndex][i]="O"
            setIsXNext(true);
          }
  
          calculateWinner(rowIndex, i);

          matrixSetup()

          setMatMove(matMove+1)
          setStepNumber(history.length)
          
        }

    }


    //Jumping to specific matrix
    const jumpTo = (step, move) =>{

      setMatrix(step)
      setMatMove(move)

      if(move%2 !==0){
        setIsXNext(false)
      }
      else{
        setIsXNext(true)
      }
    }

    //build list of moves with history data
    const moves = history.map((step, move) => {
      const desc = move ?
        'Go to move #' + move :
        'Go to game start';

      return (
        <li key={move}>
          <button
            className="btn"
            style={{
              backgroundColor: `${move%2===0 ? oColor : xColor}`
            }}
            onClick={() => jumpTo(step, move)}
          >{desc}</button>
        </li>
      );
    });

    const handleColorChange = e =>{
      
      if(e.target.name==="x")
        dispatch(onChangeXColor(e.target.value));
      else
        dispatch(onChangeOColor(e.target.value));
    }

    
  return (
      <div className="game-container">
        
        <Header 
          winner={winner} 
          isXNext={isXNext} 
          oColor={oColor}
          xColor={xColor}
        />


        <div className="game">

          <div className="left-div panel">
            {/* Color input of x and o */}
            <div className="color" style={{color: "#fff", fontSize: "20px"}}>

              <InputComponents 
                    label={"X"} 
                    type={"color"}
                    value={xColor}
                    name={"x"}
                    onChange={handleColorChange}
              /> 

              <InputComponents 
                    label={"O"} 
                    type={"color"}
                    value={oColor}
                    name={"o"}
                    onChange={handleColorChange}
              /> 
            
            </div>


            {/* Display Who is next */}

            <WhoIsNext 
                isXNext={isXNext}
            />

            {/* Input for dropdown  */}
            <div>

              <InputComponents 
                  name={"row"}
                  label={"Rows : "}
                  type={"number"}
                  onChange={handleChange}
                  placeholder={"Enter row"}
                  className={"mat-inputs"}
              />

              <InputComponents 
                  name={"column"}
                  label={"Coloums : "}
                  type={"number"}
                  onChange={handleChange}
                  placeholder={"Enter columns "}
                  className={"mat-inputs"}
              />

            
              {/* Input for winner ratio */}
              <InputComponents 
                  label={"Winner Ratio : "}
                  type={"number"}
                  onChange = {e => dispatch(onChangeWinnerRatio(Number(e.target.value)))}
                  className={"mat-inputs"}

              />
              
            </div>

            <Reset />

          </div>

          
          <MiddleDivPanel 
            matrix={matrix}
            handleClick={handleClick}
            isXNext={isXNext} 
          />

          <RightDivPanel  moves ={moves}/>
          
        </div>
      </div>
     
      );
}

export default Game;