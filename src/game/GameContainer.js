import React, { useRef, useEffect } from "react"
import { useRecoilState, useRecoilValue } from "recoil"
import { gridState, runningState, counterState, colState, rowState, sizeStr, changedSizeState } from "../recoilState/index"
import produce from "immer"
import * as Grid from "../GridDefaults"
import GameGrid from "./GameGrid"
import GameControls from "./GameControls"

export default function(props) {
  const [grid, setGrid] = useRecoilState(gridState)
  const [counter, setCounter] = useRecoilState(counterState)
  const [running, setRunning] = useRecoilState(runningState)
  // const [numCols, setNumCols] = useRecoilState(colState)
  // const [numRows, setNumRows] = useRecoilState(rowState)
  // const [gridSize, setGridSize] = useRecoilState(sizeStr)
  const gridSize = useRecoilValue(changedSizeState)
  const numCols = gridSize.updatedColumns
  const numRows = gridSize.updatedRows

  // const handleChange = e => {
  //   e.preventDefault()

  //   setSize(e.target.value)
  //   setRows(newArr[1])
  //   setColumns(newArr[0])
  // }

  const generateEmptyGrid = (r, c) => {
    const rows = []
    console.log("bitch ass function", r, c)
    for (let i = 0; i < r; i++) {
      rows.push(Array.from(Array(c), () => 0))
    }
  
    return rows
  }

  const resetGrid = () => {
    setGrid(generateEmptyGrid(numRows, numCols))
    setCounter(0)
    setRunning(false)
  }
  useEffect(() => {
    console.log(gridSize)
    resetGrid()
  }, [gridSize])


  useEffect(
    () => {
      if (running === true) {
        setTimeout(runGame, 200)
      }
    },
    [grid]
  )

  const randomizeGrid = () => {
    const rows = []
    for (let i = 0; i < numRows; i++) {
      rows.push(
        Array.from(Array(numCols), () => (Math.random() > 0.7 ? 1 : 0))
      )
    }

    setGrid(rows)
    setCounter(0)
  }

  const runningRef = useRef(running)
  runningRef.current = running

  const run = () => {
    setRunning(!running)
    if (!running) {
      runningRef.current = true
      runGame()
    }
  }
  
  const runGame = () => {
    if (!runningRef.current) {
      return
    } else {
      setGrid(g => {
        return produce(g, gridCopy => {
          for (let i = 0; i < numRows; i++) {
            for (let j = 0; j < numCols; j++) {
              let neighbors = 0
              Grid.operations.forEach(([x, y]) => {
                const newI = i + x
                const newJ = j + y
                if (
                  newI >= 0 &&
                  newI < numRows &&
                  newJ >= 0 &&
                  newJ < numCols
                ) {
                  neighbors += g[newI][newJ]
                }
              })

              if (neighbors < 2 || neighbors > 3) {
                gridCopy[i][j] = 0
              } else if (g[i][j] === 0 && neighbors === 3) {
                gridCopy[i][j] = 1
              }
            }
          }
        })
      })
    }
  }

  return (
    <div>
      <GameControls
        run={run}
        resetGrid={resetGrid}
        randomizeGrid={randomizeGrid}
      />
      <GameGrid />
      <p>
        current generation: {counter}
      </p>
    </div>
  )
}
