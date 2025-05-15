import React, { useState, useEffect, useCallback } from 'react';
import './Calculator.css';

// Haptic feedback function
const triggerHapticFeedback = () => {
  if (navigator.vibrate) {
    navigator.vibrate(10); // 10ms vibration
  }
};

// Format time for status bar
const formatTime = () => {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  }).replace(' ', '').toLowerCase();
};

const Calculator: React.FC = () => {
  const [currentOperand, setCurrentOperand] = useState('0');
  const [previousOperand, setPreviousOperand] = useState('');
  const [operation, setOperation] = useState<string | null>(null);
  const [resetOnNextInput, setResetOnNextInput] = useState(false);

  const [currentTime, setCurrentTime] = useState(formatTime());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(formatTime());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  const clear = () => {
    triggerHapticFeedback();
    setCurrentOperand('0');
    setPreviousOperand('');
    setOperation(null);
  };

  const deleteNumber = () => {
    triggerHapticFeedback();
    if (currentOperand.length === 1) {
      setCurrentOperand('0');
    } else {
      setCurrentOperand(currentOperand.slice(0, -1));
    }
  };

  const appendNumber = (number: string) => {
    triggerHapticFeedback();
    if (number === '.' && currentOperand.includes('.')) return;
    if (resetOnNextInput) {
      setCurrentOperand(number === '.' ? '0.' : number);
      setResetOnNextInput(false);
    } else {
      setCurrentOperand(
        currentOperand === '0' && number !== '.' ? number : currentOperand + number
      );
    }
  };

  const chooseOperation = (op: string) => {
    triggerHapticFeedback();
    if (currentOperand === '') return;
    if (previousOperand !== '') {
      compute();
    }
    setOperation(op);
    setPreviousOperand(`${currentOperand} ${op}`);
    setResetOnNextInput(true);
  };

  const compute = () => {
    if (!operation || previousOperand === '') return;
    
    const prev = parseFloat(previousOperand.split(' ')[0]);
    const current = parseFloat(currentOperand);
    let computation = 0;

    switch (operation) {
      case '+':
        computation = prev + current;
        break;
      case '−':
        computation = prev - current;
        break;
      case '×':
        computation = prev * current;
        break;
      case '÷':
        computation = prev / current;
        break;
      default:
        return;
    }

    setCurrentOperand(computation.toString());
    setOperation(null);
    setPreviousOperand('');
    setResetOnNextInput(true);
  };

  const handleEquals = () => {
    triggerHapticFeedback();
    if (operation === null) return;
    compute();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key >= '0' && e.key <= '9') {
      appendNumber(e.key);
    } else if (e.key === '.') {
      appendNumber('.');
    } else if (e.key === 'Escape') {
      clear();
    } else if (e.key === 'Backspace') {
      deleteNumber();
    } else if (e.key === 'Enter' || e.key === '=') {
      handleEquals();
    } else if (['+', '-', '*', '/'].includes(e.key)) {
      const opMap: { [key: string]: string } = {
        '*': '×',
        '/': '÷',
        '-': '−',
        '+': '+'
      };
      chooseOperation(opMap[e.key] || e.key);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentOperand, previousOperand, operation]);

  // Format display number with proper grouping and decimal places
  const formatDisplayNumber = useCallback((numStr: string) => {
    if (numStr === '') return '0';
    
    // Handle negative numbers
    const isNegative = numStr.startsWith('-');
    const absNumStr = isNegative ? numStr.substring(1) : numStr;
    
    // Split into integer and decimal parts
    let [integerPart, decimalPart] = absNumStr.split('.');
    
    // Format integer part with grouping
    if (integerPart) {
      integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    
    // Combine parts
    let result = isNegative ? `-${integerPart}` : integerPart;
    if (decimalPart !== undefined) {
      result += `.${decimalPart}`;
    }
    
    return result;
  }, []);

  // Handle backspace/delete functionality
  const handleBackspace = () => {
    triggerHapticFeedback();
    if (currentOperand === '0' || currentOperand.length === 1) {
      setCurrentOperand('0');
    } else {
      setCurrentOperand(currentOperand.slice(0, -1));
    }
  };

  return (
    <div className="calculator">
      {/* iOS-style status bar */}
      <div className="status-bar">
        <div className="status-bar__left">
          <span className="status-bar__time">{currentTime}</span>
        </div>
        <div className="status-bar__right">
          <span>􀋦</span>
          <span>􀋨</span>
          <span>􀋪</span>
        </div>
      </div>
      
      <div className="display">
        <div className="previous-operand">
          {previousOperand} {operation && !resetOnNextInput ? currentOperand : ''}
        </div>
        <div className="current-operand">
          {formatDisplayNumber(currentOperand)}
        </div>
      </div>
      <div className="buttons-grid">
        <button onClick={clear} className="gray" style={{ gridColumn: '1' }}>
          {currentOperand === '0' && !previousOperand ? 'AC' : 'C'}
        </button>
        <button onClick={handleBackspace} className="gray backspace" title="Delete" style={{ gridColumn: '2' }}>
          ⌫
        </button>
        <button 
          onClick={() => setCurrentOperand(prev => (parseFloat(prev) * -1).toString())} 
          className="gray" 
          style={{ gridColumn: '3' }}
        >
          +/-
        </button>
        <button 
          onClick={() => setCurrentOperand(prev => (parseFloat(prev) / 100).toString())} 
          className="gray"
          style={{ gridColumn: '4' }}
        >
          %
        </button>
        
        {/* Row 2 */}
        <button onClick={() => appendNumber('7')} className="dark-gray" style={{ gridColumn: '1' }}>
          7
        </button>
        <button onClick={() => appendNumber('8')} className="dark-gray" style={{ gridColumn: '2' }}>
          8
        </button>
        <button onClick={() => appendNumber('9')} className="dark-gray" style={{ gridColumn: '3' }}>
          9
        </button>
        <button onClick={() => chooseOperation('÷')} className="orange" style={{ gridColumn: '4' }}>
          ÷
        </button>
        
        {/* Row 3 */}
        <button onClick={() => appendNumber('4')} className="dark-gray" style={{ gridColumn: '1' }}>
          4
        </button>
        <button onClick={() => appendNumber('5')} className="dark-gray" style={{ gridColumn: '2' }}>
          5
        </button>
        <button onClick={() => appendNumber('6')} className="dark-gray" style={{ gridColumn: '3' }}>
          6
        </button>
        <button onClick={() => chooseOperation('×')} className="orange" style={{ gridColumn: '4' }}>
          ×
        </button>
        
        {/* Row 4 */}
        <button onClick={() => appendNumber('1')} className="dark-gray" style={{ gridColumn: '1' }}>
          1
        </button>
        <button onClick={() => appendNumber('2')} className="dark-gray" style={{ gridColumn: '2' }}>
          2
        </button>
        <button onClick={() => appendNumber('3')} className="dark-gray" style={{ gridColumn: '3' }}>
          3
        </button>
        <button onClick={() => chooseOperation('−')} className="orange" style={{ gridColumn: '4' }}>
          −
        </button>
        
        {/* Row 5 */}
        <button 
          onClick={() => appendNumber('0')} 
          className="dark-gray" 
          style={{
            gridColumn: '1 / span 2',
            width: 'calc(100% + 12px)',
            borderRadius: '35px',
            justifyContent: 'flex-start',
            paddingLeft: '30px'
          }}
        >
          0
        </button>
        <button 
          onClick={() => appendNumber('.')} 
          className="dark-gray" 
          style={{ gridColumn: '3' }}
        >
          .
        </button>
        <button 
          onClick={handleEquals} 
          className="orange" 
          style={{ gridColumn: '4' }}
        >
          =
        </button>
        
        {/* Row 6 - Empty row to maintain grid spacing */}
        <div style={{ gridColumn: '1 / span 4', height: '12px' }} />
      </div>
    </div>
  );
};

export default Calculator;
