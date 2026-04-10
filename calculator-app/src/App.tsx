import { useState } from 'react'
import './App.css'

function App() {
  const [display, setDisplay] = useState('0')
  const [previousValue, setPreviousValue] = useState<string | null>(null)
  const [operator, setOperator] = useState<string | null>(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)
  const [history, setHistory] = useState('')

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit)
      setWaitingForOperand(false)
    } else {
      setDisplay(display === '0' ? digit : display + digit)
    }
  }

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.')
      setWaitingForOperand(false)
      return
    }
    if (!display.includes('.')) {
      setDisplay(display + '.')
    }
  }

  const clearAll = () => {
    setDisplay('0')
    setPreviousValue(null)
    setOperator(null)
    setWaitingForOperand(false)
    setHistory('')
  }

  const toggleSign = () => {
    const value = parseFloat(display)
    if (value !== 0) {
      setDisplay(String(-value))
    }
  }

  const inputPercent = () => {
    const value = parseFloat(display)
    setDisplay(String(value / 100))
  }

  const performOperation = (nextOperator: string) => {
    const inputValue = parseFloat(display)

    if (previousValue === null) {
      setPreviousValue(String(inputValue))
      setHistory(`${inputValue} ${getOperatorSymbol(nextOperator)}`)
    } else if (operator) {
      const prevValue = parseFloat(previousValue)
      let result: number

      switch (operator) {
        case '+':
          result = prevValue + inputValue
          break
        case '-':
          result = prevValue - inputValue
          break
        case '*':
          result = prevValue * inputValue
          break
        case '/':
          result = inputValue !== 0 ? prevValue / inputValue : 0
          break
        default:
          result = inputValue
      }

      const resultStr = parseFloat(result.toFixed(10)).toString()
      setPreviousValue(resultStr)
      setDisplay(resultStr)
      setHistory(`${resultStr} ${getOperatorSymbol(nextOperator)}`)
    }

    setWaitingForOperand(true)
    setOperator(nextOperator)
  }

  const handleEquals = () => {
    if (operator === null || previousValue === null) return

    const inputValue = parseFloat(display)
    const prevValue = parseFloat(previousValue)
    let result: number

    switch (operator) {
      case '+':
        result = prevValue + inputValue
        break
      case '-':
        result = prevValue - inputValue
        break
      case '*':
        result = prevValue * inputValue
        break
      case '/':
        result = inputValue !== 0 ? prevValue / inputValue : 0
        break
      default:
        result = inputValue
    }

    const resultStr = parseFloat(result.toFixed(10)).toString()
    setDisplay(resultStr)
    setHistory(`${prevValue} ${getOperatorSymbol(operator)} ${inputValue} =`)
    setPreviousValue(null)
    setOperator(null)
    setWaitingForOperand(true)
  }

  const getOperatorSymbol = (op: string) => {
    switch (op) {
      case '+': return '+'
      case '-': return '\u2212'
      case '*': return '\u00d7'
      case '/': return '\u00f7'
      default: return op
    }
  }

  const formatDisplay = (value: string) => {
    if (value.includes('.')) {
      const [intPart, decPart] = value.split('.')
      const formattedInt = Number(intPart).toLocaleString()
      return `${formattedInt}.${decPart}`
    }
    return Number(value).toLocaleString()
  }

  const getDisplayFontSize = () => {
    const len = display.replace(/[^0-9.]/g, '').length
    if (len > 12) return 'text-2xl'
    if (len > 9) return 'text-3xl'
    if (len > 6) return 'text-4xl'
    return 'text-5xl'
  }

  const buttons = [
    { label: 'AC', action: clearAll, style: 'bg-zinc-600 hover:bg-zinc-500 text-white' },
    { label: '+/\u2212', action: toggleSign, style: 'bg-zinc-600 hover:bg-zinc-500 text-white' },
    { label: '%', action: inputPercent, style: 'bg-zinc-600 hover:bg-zinc-500 text-white' },
    { label: '\u00f7', action: () => performOperation('/'), style: operator === '/' && waitingForOperand ? 'bg-white text-amber-500 ring-2 ring-amber-400' : 'bg-amber-500 hover:bg-amber-400 text-white' },

    { label: '7', action: () => inputDigit('7'), style: 'bg-zinc-700 hover:bg-zinc-600 text-white' },
    { label: '8', action: () => inputDigit('8'), style: 'bg-zinc-700 hover:bg-zinc-600 text-white' },
    { label: '9', action: () => inputDigit('9'), style: 'bg-zinc-700 hover:bg-zinc-600 text-white' },
    { label: '\u00d7', action: () => performOperation('*'), style: operator === '*' && waitingForOperand ? 'bg-white text-amber-500 ring-2 ring-amber-400' : 'bg-amber-500 hover:bg-amber-400 text-white' },

    { label: '4', action: () => inputDigit('4'), style: 'bg-zinc-700 hover:bg-zinc-600 text-white' },
    { label: '5', action: () => inputDigit('5'), style: 'bg-zinc-700 hover:bg-zinc-600 text-white' },
    { label: '6', action: () => inputDigit('6'), style: 'bg-zinc-700 hover:bg-zinc-600 text-white' },
    { label: '\u2212', action: () => performOperation('-'), style: operator === '-' && waitingForOperand ? 'bg-white text-amber-500 ring-2 ring-amber-400' : 'bg-amber-500 hover:bg-amber-400 text-white' },

    { label: '1', action: () => inputDigit('1'), style: 'bg-zinc-700 hover:bg-zinc-600 text-white' },
    { label: '2', action: () => inputDigit('2'), style: 'bg-zinc-700 hover:bg-zinc-600 text-white' },
    { label: '3', action: () => inputDigit('3'), style: 'bg-zinc-700 hover:bg-zinc-600 text-white' },
    { label: '+', action: () => performOperation('+'), style: operator === '+' && waitingForOperand ? 'bg-white text-amber-500 ring-2 ring-amber-400' : 'bg-amber-500 hover:bg-amber-400 text-white' },

    { label: '0', action: () => inputDigit('0'), style: 'bg-zinc-700 hover:bg-zinc-600 text-white col-span-2' },
    { label: '.', action: inputDecimal, style: 'bg-zinc-700 hover:bg-zinc-600 text-white' },
    { label: '=', action: handleEquals, style: 'bg-amber-500 hover:bg-amber-400 text-white' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <h1 className="text-center text-zinc-400 text-sm font-medium tracking-widest uppercase mb-6">
          Calculator
        </h1>

        <div className="bg-zinc-800 rounded-3xl shadow-2xl overflow-hidden border border-zinc-700/50">
          {/* Display */}
          <div className="p-6 pb-4">
            <div className="text-right text-zinc-500 text-sm h-6 mb-1 truncate">
              {history}
            </div>
            <div className={`text-right text-white font-light transition-all duration-200 ${getDisplayFontSize()} truncate`}>
              {formatDisplay(display)}
            </div>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-4 gap-px bg-zinc-900/50 p-3">
            {buttons.map((btn, index) => (
              <button
                key={index}
                onClick={btn.action}
                className={`${btn.style} rounded-2xl font-medium text-xl py-4 transition-all duration-150 active:scale-95 active:brightness-75`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-zinc-600 text-xs mt-4">
          Built with React + Tailwind CSS
        </p>
      </div>
    </div>
  )
}

export default App
