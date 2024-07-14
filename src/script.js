// 完整版本，添加更多功能
// 設置 Babel 編譯器
/** @jsx React.createElement */
/** @jsxFrag React.Fragment */

// 導入 React 和 ReactDOM
const { useState, useEffect, useRef } = React;

// 定義元素
const PromptGenerator = () => {
  const [isBlock2Collapsed, setIsBlock2Collapsed] = useState(false);
  const [isBlock3Collapsed, setIsBlock3Collapsed] = useState(true);
  const [copyStatus, setCopyStatus] = useState('複製到剪貼簿');
  const [structure, setStructure] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [selectedVariable, setSelectedVariable] = useState(null);
  const [finalPrompt, setFinalPrompt] = useState('');
  const [draggedElement, setDraggedElement] = useState(null);
  const [tooltipContent, setTooltipContent] = useState('');
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  const structureAreaRef = useRef(null);
  
  const handleMouseEnter = (content, event) => {
  setTooltipContent(content);
  setTooltipPosition({ x: event.clientX, y: event.clientY });
  setIsTooltipVisible(true);
  };

  const handleMouseLeave = () => {
    setIsTooltipVisible(false);
  };

  const handleMouseMove = (event) => {
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  // 初始化結構
  useEffect(() => {
    if (structure.length === 0) {
      setStructure([{ ...elements.basicInstruction, id: Date.now() }]);
    }
  }, []);

  const handleElementClick = (element) => {
    setSelectedElement(element);
    setSelectedVariable(element.variables ? element.variables[0] : null);
    setIsBlock2Collapsed(true);
    setIsBlock3Collapsed(false);  // 當選擇元素時，展開區塊3
  };
  
  const elements = {
    basicInstruction: {
      name: '任務目標',
      category: '任務定義',
      description: '告訴AI你想完成什麼。就像告訴朋友你需要他們幫什麼忙。',
      tags: [],
      content: '我希望你{{執行動作}}來{{達成目標}}。',
      reusable: true,
      editType: 'longText',
      variables: [
        { name: '執行動作', value: '' },
        { name: '達成目標', value: '' }
      ]
    },
    roleSettings: {
      name: '角色扮演',
      category: '任務定義',
      description: '讓AI扮演特定角色。比如讓它假裝是老師或醫生來回答問題。',
      tags: [],
      content: '在這個任務中，你是{{角色描述}}。',
      reusable: false,
      editType: 'longText',
      variables: [
        { name: '角色描述', value: '' }
      ]
    },
    taskSteps: {
      name: '步驟列舉',
      category: '任務定義',
      description: '要求AI按步驟回答。就像食譜一樣，一步一步地說明。',
      tags: [],
      content: '請按以下步驟執行任務：\n1. {{步驟1}}\n2. {{步驟2}}\n3. {{步驟3}}\n…',
      reusable: true,
      editType: 'longText',
      variables: [
        { name: '步驟1', value: '' },
        { name: '步驟2', value: '' },
        { name: '步驟3', value: '' }
      ]
    },
    referenceData: {
      name: '資料引用',
      category: '內容輸入',
      description: '告訴AI使用特定資料。像是給它一本書，然後要它用書中的內容回答。',
      tags: ['reference'],
      content: '請參考以下資料：\n{{參考內容}}',
      reusable: true,
      editType: 'longText',
      variables: [
        { name: '參考內容', value: '' }
      ]
    },
    exampleExplanation: {
      name: '舉例說明',
      category: '內容輸入',
      description: '要求AI給出例子。就像問朋友「比如說呢？」來更好理解。',
      tags: ['example'],
      content: '這裡有一個例子：\n{{範例內容}}',
      reusable: true,
      editType: 'longText',
      variables: [
        { name: '範例內容', value: '' }
      ]
    },
    backgroundInfo: {
      name: '背景資訊',
      category: '內容輸入',
      description: '給AI一些背景知識。像是在問問題前先解釋情況。',
      tags: ['background'],
      content: '任務背景：{{背景描述}}',
      reusable: false,
      editType: 'longText',
      variables: [
        { name: '背景描述', value: '' }
      ]
    },
    thinkingProcess: {
      name: '思考過程',
      category: '思考控制',
      description: '要求AI解釋它的想法。就像問朋友「你是怎麼想到的？」',
      tags: ['thinking'],
      content: '請在回答前，先在<thinking>標籤內詳細說明你的思考過程。',
      reusable: false,
      editType: 'checkbox',
      isIncluded: false
    },
    multiAngleAnalysis: {
      name: '多角度分析',
      category: '思考控制',
      description: '請AI從不同方面考慮問題。像是看一個物品的各個面。',
      tags: [],
      content: '請從以下角度分析這個問題：\n1. {{角度1}}\n2. {{角度2}}',
      reusable: true,
      editType: 'longText',
      variables: [
        { name: '角度1', value: '' },
        { name: '角度2', value: '' }
      ]
    },
    hypotheticalScenario: {
      name: '假設情境',
      category: '思考控制',
      description: '讓AI想像「如果...會怎樣」。就像玩想像遊戲。',
      tags: ['scenario'],
      content: '假設{{特定情境}}，你會如何應對？',
      reusable: true,
      editType: 'longText',
      variables: [
        { name: '特定情境', value: '' }
      ]
    },
    clearDecision: {
      name: '明確抉擇',
      category: '思考控制',
      description: '要求AI做出明確的選擇或決定。就像問朋友「你會選哪一個？」',
      tags: ['decision'],
      content: '在考慮所有因素後，請做出一個明確的{{決策類型}}。如果有不確定性，請說明原因，但仍然給出一個明確的選擇。',
      reusable: true,
      editType: 'longText',
      variables: [
        { name: '決策類型', value: '' }
      ]
    },
    formatSpecification: {
      name: '格式指定',
      category: '輸出控制',
      description: '告訴AI你要什麼樣的回答形式。比如列表或段落。',
      tags: ['format'],
      content: '請以{{指定格式}}的形式呈現你的回答。',
      reusable: false,
      editType: 'select',
      options: ['列表形式', '表格形式', '段落形式', '大綱形式', 'JSON 格式', '自訂義'],
      selectedOption: '',
      customOption: '',
      variables: [
        { name: '指定格式', value: '' }
      ]
    },
    responseLimit: {
      name: '回答篇幅限制',
      category: '輸出控制',
      description: '設定AI回答的長度。像是限制朋友說話的時間。',
      tags: [],
      content: '請將你的回答篇幅限制在{{字數/段落數}}以內。',
      reusable: true,
      editType: 'select',
      options: ['100字以內', '500字以內', '1000字以內', '3段落以內', '5段落以內', '自訂義'],
      selectedOption: '',
      customOption: '',
      variables: [
        { name: '字數/段落數', value: '' }
      ]
    },
    keySummary: {
      name: '重點總結',
      category: '輸出控制',
      description: '要求AI總結要點。就像請朋友複述重要的部分。',
      tags: ['summary'],
      content: '在回答結束時，請用一段簡短的文字總結主要觀點。',
      reusable: false,
      editType: 'checkbox',
      isIncluded: false
    },
    outputStyle: {
      name: '輸出風格',
      category: '輸出控制',
      description: '指定AI回答的語氣或風格。像是請朋友用幽默或正式的方式說話。',
      tags: ['output_style'],
      content: '請使用{{風格描述}}的方式回答，{{是否包含問候語}}。',
      reusable: false,
      editType: 'mixed',
      options: {
        風格描述: ['正式', '隨意', '專業', '幽默', '自訂義'],
        是否包含問候語: ['包含簡短的問候語', '直接進入主題，不需要問候語']
      },
      selectedOption: '',
      customOption: '',
      variables: [
        { name: '風格描述', value: '', customValue: '' },
        { name: '是否包含問候語', value: '' }
      ]
    },
    timeSensitive: {
      name: '時間背景設定',
      category: '自訂義',
      description: '告訴AI考慮特定時間點。像是問「如果是在過去，會怎樣？」',
      tags: ['time_sensitive'],
      content: '請考慮{{時間點/時期}}的特定情況來回答這個問題。',
      reusable: true,
      editType: 'longText',
      variables: [
        { name: '時間點/時期', value: '' }
      ]
    },
    contrastAnalysis: {
      name: '比較分析',
      category: '自訂義',
      description: '要求AI比較不同事物。就像問「這個和那個有什麼不同？」',
      tags: ['compare'],
      content: '請比較以下主題的異同，並分析各自的優缺點：\n1. {{主題1}}\n2. {{主題2}}',
      reusable: true,
      editType: 'longText',
      variables: [
        { name: '主題1', value: '' },
        { name: '主題2', value: '' }
      ]
    },
    creativeSpark: {
      name: '創意思考',
      category: '自訂義',
      description: '鼓勵AI有創意地思考。像是玩「想出與眾不同的點子」遊戲。',
      tags: ['creative_prompt'],
      content: '請發揮創意，想像{{非常規情境}}下會發生什麼。',
      reusable: true,
      editType: 'longText',
      variables: [
        { name: '非常規情境', value: '' }
      ]
    },
    ethicalConsideration: {
      name: '倫理考量',
      category: '自訂義',
      description: '請AI考慮道德問題。像是問「這樣做對嗎？為什麼？」',
      tags: ['ethical_consideration'],
      content: '在回答時，請考慮{{特定倫理問題}}的影響。',
      reusable: true,
      editType: 'longText',
      variables: [
        { name: '特定倫理問題', value: '' }
      ]
    },
    dataAnalysis: {
      name: '數據分析',
      category: '自訂義',
      description: '要求AI分析數字資料。就像請數學高手看複雜的圖表。',
      tags: ['data_analysis'],
      content: '請分析以下數據集：{{數據描述}}，並提供關鍵洞見。',
      reusable: true,
      editType: 'longText',
      variables: [
        { name: '數據描述', value: '' }
      ]
    },
    multilingual: {
      name: '多語言回覆',
      category: '自訂義',
      description: '要求AI用多種語言回答。像是請翻譯同時用幾種語言說。',
      tags: ['multilingual'],
      content: '請用以下語言回答這個問題：\n1. {{語言1}}\n2. {{語言2}}',
      reusable: true,
      editType: 'dynamicSelect',
      options: ['英語', '中文（台灣）', '日語', '西班牙語', '法語', '德語', '自訂義'],
      selectedOption: '',
      customOption: '',
      variables: [
        { name: '語言1', value: '', customValue: '' },
        { name: '語言2', value: '', customValue: '' }
      ]
    },
    technicalTerms: {
      name: '專業術語',
      category: '自訂義',
      description: '要求AI使用並解釋專業用語。像是請專家解釋難懂的字。',
      tags: ['technical_terms'],
      content: '在回答中，請使用{{專業領域}}的專業術語，並簡要解釋這些術語。',
      reusable: true,
      editType: 'longText',
      variables: [
        { name: '專業領域', value: '' }
      ]
    },
    counterfactualThinking: {
      name: '反事實思考',
      category: '自訂義',
      description: '讓AI想像如果歷史不同會怎樣。像是玩「如果」的歷史遊戲。',
      tags: ['counterfactual'],
      content: '假設{{某個事實或條件}}是不同的，結果會如何改變？',
      reusable: true,
      editType: 'longText',
      variables: [
        { name: '某個事實或條件', value: '' }
      ]
    },
    factCheck: {
      name: '事實核查',
      category: '思考控制',
      description: '要求AI確保信息準確。像是提醒朋友要說實話。',
      tags: ['fact_check'],
      description: '在回答之前，請仔細查證所有相關事實。如果發現任何不確定或有爭議的信息，請在回答中明確指出。',
      content: '在回答之前，請仔細查證所有相關事實。如果發現任何不確定或有爭議的信息，請在回答中明確指出。',
      reusable: false,
      editType: 'checkbox',
      isIncluded: false
    },
    adjustPoints: {
      name: '重點修正列表',
      category: '輸出控制',
      description: '列出需要AI修改的地方。就像改作業時的修改建議。',
      tags: ['adjust_points'],
      description: '根據指定要點調整回答',
      content: '請根據以下要點調整你的回答：\n1. {{問題1}}\n2. {{問題2}}\n3. {{問題3}}',
      reusable: true,
      editType: 'longText',
      variables: [
        { name: '問題1', value: '' },
        { name: '問題2', value: '' },
        { name: '問題3', value: '' }
      ]
    },
    problemRestate: {
      name: '問題重述對照',
      category: '任務定義',
      description: '用不同方式重新說明問題。幫助AI更好理解你的意思。',
      tags: ['problem_restate'],
      description: '重新描述問題並基於新描述回答',
      content: '我將重新描述問題，請基於新的描述進行回答：\n原始描述：{{修改前}}\n新描述：{{修改後}}',
      reusable: false,
      editType: 'longText',
      variables: [
        { name: '修改前', value: '' },
        { name: '修改後', value: '' }
      ]
    },
    continueGeneration: {
      name: '內容延續',
      category: '輸出控制',
      description: '要求AI繼續前面的內容。像是請朋友繼續說下去。',
      tags: ['continue'],
      description: '基於之前的內容繼續生成',
      content: '請基於之前的內容繼續生成，保持一致的風格和主題。',
      reusable: true,
      editType: 'checkbox',
      isIncluded: false
    },
    attachmentReference: {
      name: '🔗 附件參考',
      category: '內容輸入',
      description: '告訴AI看附加的資料。就像給朋友看照片然後討論。',
      tags: ['attachment'],
      description: '參考附件內容並進行調整',
      content: '請參考附件中的內容，並協助我{{調整項目}}。注意：回答時請明確指出你是基於什麼具體信息進行調整的。',
      reusable: true,
      editType: 'longText',
      variables: [
        { name: '調整項目', value: '' }
      ]
    },
    focusEditInstruction: {
      name: '修改聚焦',
      category: '輸出控制',
      description: '要求AI只輸出需要調整的特定部分，並給出相關說明。像是請人只修改文件中的某一段。',
      tags: ['focus_edit'],
      content: '只輸出需要調整的{{內容類型}}部分，並提供足夠的上下文指示。',
      reusable: true,
      editType: 'longText',
      variables: [
        { name: '內容類型', value: '' }
      ]
    }
  };

  const elementSections = [
    {
      title: "任務定義",
      icon: "📋",
      elements: ['basicInstruction', 'roleSettings', 'taskSteps', 'problemRestate']
    },
    {
      title: "內容輸入",
      icon: "📝",
      elements: ['referenceData', 'exampleExplanation', 'backgroundInfo', 'attachmentReference']
    },
    {
      title: "思考控制",
      icon: "🧠",
      elements: ['thinkingProcess', 'multiAngleAnalysis', 'hypotheticalScenario', 'clearDecision', 'factCheck']
    },
    {
      title: "輸出控制",
      icon: "📤",
      elements: ['formatSpecification', 'responseLimit', 'keySummary', 'outputStyle', 'focusEditInstruction']
    },
    {
      title: "自訂義",
      icon: "🛠️",
      elements: [
        'timeSensitive',
        'contrastAnalysis',
        'creativeSpark',
        'ethicalConsideration',
        'dataAnalysis',
        'multilingual',
        'technicalTerms',
        'counterfactualThinking'
      ]
    }
  ];
  
  const adjustButtonWidths = () => {
    const buttons = document.querySelectorAll('.structure-element');
    buttons.forEach(button => {
      button.style.width = 'auto';
      const textElement = button.querySelector('.button-text');
      const removeButton = button.querySelector('.remove-button');
      const textWidth = textElement.scrollWidth;
      const newWidth = textWidth + removeButton.offsetWidth + 20; // 20px for padding
      button.style.width = `${newWidth}px`;
    });
  };
  
  
  const adjustElementWidths = () => {
    if (structureAreaRef.current) {
      const elements = structureAreaRef.current.querySelectorAll('.structure-element');
      elements.forEach(element => {
        const button = element.querySelector('.element-button');
        const buttonText = button.querySelector('.button-text');
        const removeButton = button.querySelector('.remove-button');

        // 重置寬度以獲取實際內容寬度
        button.style.width = 'auto';
        buttonText.style.width = 'auto';

        const textWidth = buttonText.offsetWidth;
        const removeButtonWidth = removeButton.offsetWidth;
        const newWidth = textWidth + removeButtonWidth + 20; // 20px for padding

        button.style.width = `${newWidth}px`;
      });
    }
  };
  
    // 新增的 useEffect，用於監聽容器大小變化
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      adjustButtonWidths();
    });

    if (structureAreaRef.current) {
      resizeObserver.observe(structureAreaRef.current);
    }

    return () => {
      if (structureAreaRef.current) {
        resizeObserver.unobserve(structureAreaRef.current);
      }
    };
  }, []);

  // 新增的 useEffect，用於在 structure 變化時調整按鈕寬度
  useEffect(() => {
    adjustButtonWidths();
  }, [structure]);
  
  useEffect(() => {
    adjustElementWidths();
    window.addEventListener('resize', adjustElementWidths);
    return () => window.removeEventListener('resize', adjustElementWidths);
  }, [structure]);
  
  useEffect(() => {
    setStructure([elements.basicInstruction]);
  }, []);

  useEffect(() => {
    const prompt = structure.map(element => {
      let content = element.content;
      if (element.variables) {
        element.variables.forEach(variable => {
          const regex = new RegExp(`{{${variable.name}}}`, 'g');
          let replacementValue = variable.value;
          if (element.editType === 'dynamicSelect' || (element.editType === 'mixed' && element.options[variable.name].includes('自訂義'))) {
            replacementValue = variable.value === '自訂義' ? variable.customValue : variable.value;
          }
          content = content.replace(regex, replacementValue || `{{${variable.name}}}`);
        });
      }

      if (element.tag && content.trim()) {
        return `<${element.tag}>\n${content}\n</${element.tag}>`;
      }
      return content;
    }).join('\n\n');

    const finalContent = `\\\n${prompt}\n\\`;
    setFinalPrompt(finalContent);
  }, [structure]);
  
// 初始化結構
useEffect(() => {
  if (structure.length === 0) {
    setStructure([{ ...elements.basicInstruction, id: Date.now() }]);
  }
}, []);

// 生成最終提示詞
useEffect(() => {
  const promptContent = structure.map(element => {
    let content = element.content;
    if (element.variables) {
      element.variables.forEach(variable => {
        const regex = new RegExp(`{{${variable.name}}}`, 'g');
        let replacementValue = variable.value;
        if (element.editType === 'dynamicSelect' || (element.editType === 'mixed' && element.options[variable.name].includes('自訂義'))) {
          replacementValue = variable.value === '自訂義' ? variable.customValue : variable.value;
        }
        content = content.replace(regex, replacementValue || `{{${variable.name}}}`);
      });
    }

    if (element.tags && element.tags.length > 0) {
      const tag = element.tags[0]; // 使用第一個標籤
      return `<${tag}>\n${content}\n</${tag}>`;
    }
    return content;
  }).join('\n\n');
  
  setFinalPrompt(promptContent);
}, [structure]);
  
  const addElement = element => {
    if (!element.reusable && structure.some(e => e.name === element.name)) {
      return;
    }

    const newElement = {
      ...element,
      id: Date.now(),
      variables: element.variables ? element.variables.map(v => ({ ...v, value: '' })) : [],
      selectedOption: '',
      isIncluded: element.editType === 'checkbox' ? false : undefined
    };

    setStructure(prevStructure => [...prevStructure, newElement]);
  };

  const removeElement = (index) => {
    const newStructure = structure.filter((_, i) => i !== index);
    setStructure(newStructure);
    
    if (selectedElement === structure[index]) {
      setSelectedElement(null);
      setSelectedVariable(null);
      setIsBlock3Collapsed(true);  // 當移除選中的元素時，收起區塊3
    }
    // 如果結構被清空，展開區塊2
    if (newStructure.length === 0) {
      setIsBlock2Collapsed(false);
    }
  };

  const updateElement = (index, updates) => {
    const newStructure = [...structure];
    newStructure[index] = { ...newStructure[index], ...updates };
    setStructure(newStructure);
    if (selectedElement === structure[index]) {
      setSelectedElement(newStructure[index]);
    }
  };

  // 新增的輔助函數
  const updateElementContent = (element) => {
    const contentTemplate = {
      '步驟列舉': '請按以下步驟執行任務：\n',
      '多角度分析': '請從以下角度分析這個問題：\n',
      '比較分析': '請比較以下主題的異同，並分析各自的優缺點：\n',
      '多語言回覆': '請用以下語言回答這個問題：\n',
      '重點修正列表': '請根據以下要點調整你的回答：\n'
    };

    if (contentTemplate[element.name]) {
      return contentTemplate[element.name] + element.variables.map((v, index) => `${index + 1}. {{${v.name}}}`).join('\n');
    }
    return element.content;
  };

  const addOption = (elementId) => {
    setStructure(prevStructure => {
      const newStructure = prevStructure.map(element => {
        if (element.id === elementId) {
          const newOptionNumber = element.variables.length + 1;
          let newVariableName;
          switch (element.name) {
            case '步驟列舉':
              newVariableName = `步驟${newOptionNumber}`;
              break;
            case '多角度分析':
              newVariableName = `角度${newOptionNumber}`;
              break;
            case '比較分析':
              newVariableName = `主題${newOptionNumber}`;
              break;
            case '多語言回覆':
              newVariableName = `語言${newOptionNumber}`;
              break;
            case '重點修正列表':
              newVariableName = `問題${newOptionNumber}`;
              break;
            default:
              newVariableName = `選項${newOptionNumber}`;
          }
          const newVariable = { name: newVariableName, value: '' };
          const newVariables = [...element.variables, newVariable];
          const newContent = updateElementContent({ ...element, variables: newVariables });
          return { ...element, variables: newVariables, content: newContent };
        }
        return element;
      });

      // 更新 selectedElement
      const updatedElement = newStructure.find(e => e.id === elementId);
      if (updatedElement) {
        setSelectedElement(updatedElement);
      }

      return newStructure;
    });
  };

  const removeOption = (elementId) => {
    setStructure(prevStructure => {
      const newStructure = prevStructure.map(element => {
        if (element.id === elementId && element.variables.length > 1) {
          const newVariables = element.variables.slice(0, -1);
          const newContent = updateElementContent({ ...element, variables: newVariables });
          return { ...element, variables: newVariables, content: newContent };
        }
        return element;
      });

      // 更新 selectedElement
      const updatedElement = newStructure.find(e => e.id === elementId);
      if (updatedElement) {
        setSelectedElement(updatedElement);
      }

      return newStructure;
    });
  };

  // 修改 updateVariable 函數以更新 content
  const updateVariable = (elementId, variableName, value, isCustom = false) => {
    setStructure(prevStructure => {
      const newStructure = prevStructure.map(element => {
        if (element.id === elementId) {
          const newVariables = element.variables.map(v => {
            if (v.name === variableName) {
              if (element.editType === 'select' || element.editType === 'dynamicSelect' || (element.editType === 'mixed' && element.options[variableName].includes('自訂義'))) {
                return {
                  ...v,
                  value: isCustom ? '自訂義' : value,
                  customValue: isCustom ? value : v.customValue
                };
              } else {
                return { ...v, value };
              }
            }
            return v;
          });
          const newContent = updateElementContent({ ...element, variables: newVariables });
          return { ...element, variables: newVariables, content: newContent };
        }
        return element;
      });

      // 更新 selectedElement
      const updatedElement = newStructure.find(e => e.id === elementId);
      if (updatedElement) {
        setSelectedElement(updatedElement);
      }

      return newStructure;
    });
  };
  
  const generateContent = (elementName, variables) => {
    switch (elementName) {
      case '步驟列舉':
      case '多角度分析':
      case '比較分析':
      case '多語言回覆':
      case '重點修正列表':
        return `${elementName}：\n${variables.map((v, index) => `${index + 1}. {{${v.name}}}`).join('\n')}`;
      default:
        return variables.map((v) => `{{${v.name}}}`).join('\n');
    }
  };

  const copyToClipboard = () => {
    if (navigator.clipboard && window.isSecureContext) {
      // 對於支援 Clipboard API 的現代瀏覽器
      navigator.clipboard.writeText(finalPrompt)
        .then(() => {
          setCopyStatus('已複製！');
          setTimeout(() => setCopyStatus('複製到剪貼簿'), 2000);  // 2秒後重置狀態
        })
        .catch((err) => {
          console.error('無法複製文字: ', err);
          fallbackCopyTextToClipboard(finalPrompt);
        });
    } else {
      // 不支援 Clipboard API 的瀏覽器使用備用方法
      fallbackCopyTextToClipboard(finalPrompt);
    }
  };

const fallbackCopyTextToClipboard = (text) => {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  
  // 避免滾動到底部
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand('copy');
    if (successful) {
      setCopyStatus('已複製！');
      setTimeout(() => setCopyStatus('複製到剪貼簿'), 2000);
    } else {
      setCopyStatus('複製失敗');
      setTimeout(() => setCopyStatus('複製到剪貼簿'), 2000);
    }
  } catch (err) {
    console.error('無法複製文字: ', err);
    setCopyStatus('複製失敗');
    setTimeout(() => setCopyStatus('複製到剪貼簿'), 2000);
  }

  document.body.removeChild(textArea);
};
  
  const resetToDefault = () => {
    setStructure([elements.basicInstruction]);
    setSelectedElement(null);
    setSelectedVariable(null);
    setIsBlock2Collapsed(false);
    setIsBlock3Collapsed(true);  // 當移除選中的元素時，收起區塊3
  };

  const handleDragStart = (e, index) => {
    setDraggedElement(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    const draggedOverItem = structure[index];

    if (draggedElement === null || draggedElement === index) {
      return;
    }

    const newStructure = [...structure];
    newStructure.splice(index, 0, newStructure.splice(draggedElement, 1)[0]);
    setStructure(newStructure);
    setDraggedElement(index);
  };

  const handleDragEnd = () => {
    setDraggedElement(null);
  };

  const getCategoryClass = (category) => {
    switch(category) {
      case '任務定義': return 'task-definition';
      case '內容輸入': return 'content-input';
      case '思考控制': return 'thought-control';
      case '輸出控制': return 'output-control';
      case '自訂義': return 'custom';
      default: return '';
    }
  };

  // 工具提示組件
  const Tooltip = ({ children, text }) => {
    return (
      <div className="tooltip">
        {children}
        <span className="tooltiptext">{text}</span>
      </div>
    );
  };
  
  // checkbox按鈕類型
  const renderElementButton = (element, sectionTitle) => {
    const elementCount = structure.filter(e => e.name === element.name).length;
    const isSelected = elementCount > 0;
    const isDisabled = !element.reusable && isSelected;

    return (
      <button
        key={element.name}
        className={`${getCategoryClass(sectionTitle)}`}
        onClick={() => {
          if (element.editType === 'checkbox') {
            if (isSelected) {
              setStructure(structure.filter(e => e.name !== element.name));
            } else {
              addElement(element);
            }
          } else if (element.reusable || !isSelected) {
            addElement(element);
          }
        }}
        disabled={isDisabled}
        onMouseEnter={(e) => handleMouseEnter(element.description || '點擊添加此元素', e)}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
      >
        <div className="element-content" title={element.name}>
          {element.name}
        </div>
        {isSelected && (
          element.reusable ? 
          <span className="element-count">{elementCount}</span> : 
          <span className="selected-mark">✓</span>
        )}
      </button>
    );
  };
  
  const getTruncatedFirstLine = (content, maxLength = 30) => {
    const firstLine = content.split('\n')[0].trim();
    if (firstLine.length <= maxLength) {
      return firstLine;
    }
    return firstLine.substring(0, maxLength - 3) + '...';
  };
  
  return (
    <div className="prompt-generator">
      {/* 區塊1: Prompt架構編輯區 */}
      <div className="card">
        <h2 className="section-title">架構編輯區</h2>
        <div className="structure-area" ref={structureAreaRef}>
          {structure.map((element, index) => (
            <div
              key={element.id}
              className={`structure-element ${getCategoryClass(element.category)}`}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
            >
              <button 
                className="element-button structure-button"
                onClick={() => handleElementClick(element)}
              >
                <span className="button-text">{element.name}</span>
                <span 
                  className="remove-button" 
                  onClick={(e) => {
                    e.stopPropagation();
                    removeElement(index);
                  }}
                  aria-label="移除元素"
                >
                  ×
                </span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 區塊2: Element放置區 */}
      <div className={`card ${isBlock2Collapsed ? 'collapsed' : ''}`}>
        <h2 
          className={`section-title ${isBlock2Collapsed ? 'collapsed' : ''}`}
          onClick={() => setIsBlock2Collapsed(!isBlock2Collapsed)}
        >
          元素放置區
          <span className="arrow">{isBlock2Collapsed ? '▼' : '▼'}</span>
        </h2>
        <div className="element-placement-area">
          <div className="element-grid">
            {elementSections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="element-section">
                <h3 className="subsection-title">
                  <span className="section-icon">{section.icon}</span>
                  {section.title}
                </h3>
                <div className="element-buttons">
                  {section.elements.map((elementKey) => {
                    const element = elements[elementKey];
                    return renderElementButton(element, section.title);
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* 區塊3: 變數內容填寫區 */}
      <div className={`card ${isBlock3Collapsed ? 'collapsed' : ''}`}>
        <h2 
          className="section-title" 
          onClick={() => setIsBlock3Collapsed(!isBlock3Collapsed)}
        >
          變數內容填寫區
          <span className="arrow">{isBlock3Collapsed ? '▶' : '▼'}</span>
        </h2>
        <div className="variable-content-area">
          {selectedElement ? (
            <div className="variable-editor">
              <h3 className="element-content-title">
                {getTruncatedFirstLine(selectedElement.content)}
              </h3>
                  {selectedElement.editType === 'select' && (
                  <div className="variable-item">
                  {/*<label>{selectedElement.variables[0].name}:</label>*/}
                    <select
                      value={selectedElement.variables[0].value}
                      onChange={(e) => updateVariable(selectedElement.id, selectedElement.variables[0].name, e.target.value)}
                    >
                      <option value="">選擇一個選項</option>
                      {selectedElement.options.map((option, optionIndex) => (
                        <option key={optionIndex} value={option}>{option}</option>
                      ))}
                    </select>
                    {selectedElement.variables[0].value === '自訂義' && (
                      <input
                        type="text"
                        value={selectedElement.variables[0].customValue || ''}
                        onChange={(e) => updateVariable(selectedElement.id, selectedElement.variables[0].name, e.target.value, true)}
                        placeholder="請輸入自訂選項"
                      />
                    )}
                  </div>
                )}
              {selectedElement.editType === 'dynamicSelect' && (
                selectedElement.variables.map((variable, index) => (
                  <div key={index} className="variable-item">
                    {/*<label>{variable.name}:</label>*/}
                    <select
                      value={variable.value}
                      onChange={(e) => updateVariable(selectedElement.id, variable.name, e.target.value)}
                    >
                      <option value="">選擇一個選項</option>
                      {selectedElement.options.map((option, optionIndex) => (
                        <option key={optionIndex} value={option}>{option}</option>
                      ))}
                    </select>
                    {variable.value === '自訂義' && (
                      <input
                        type="text"
                        value={variable.customValue || ''}
                        onChange={(e) => updateVariable(selectedElement.id, variable.name, e.target.value, true)}
                        placeholder="請輸入自訂選項"
                      />
                    )}
                  </div>
                ))
              )}
              {selectedElement.editType === 'mixed' && (
                selectedElement.variables.map((variable, index) => (
                  <div key={index} className="variable-item">
                    {/*<label>{variable.name}:</label>*/}
                    <select
                      value={variable.value}
                      onChange={(e) => updateVariable(selectedElement.id, variable.name, e.target.value)}
                    >
                      <option value="">選擇一個選項</option>
                      {selectedElement.options[variable.name].map((option, optionIndex) => (
                        <option key={optionIndex} value={option}>{option}</option>
                      ))}
                    </select>
                    {selectedElement.options[variable.name].includes('自訂義') && variable.value === '自訂義' && (
                      <input
                        type="text"
                        value={variable.customValue || ''}
                        onChange={(e) => updateVariable(selectedElement.id, variable.name, e.target.value, true)}
                        placeholder="請輸入自訂選項"
                      />
                    )}
                  </div>
                ))
              )}
              {selectedElement.editType === 'longText' && (
                selectedElement.variables.map((variable, index) => (
                  <div key={index} className="variable-item">
                    {/*<label>{variable.name}:</label>*/}
                    <textarea
                      value={variable.value || ''}
                      onChange={(e) => updateVariable(selectedElement.id, variable.name, e.target.value)}
                      placeholder={`請輸入${variable.name}`}
                    />
                  </div>
                ))
              )}
              {['步驟列舉', '多角度分析', '比較分析', '多語言回覆', '重點修正列表'].includes(selectedElement.name) && (
                <div className="option-buttons">
                    <button onClick={() => addOption(selectedElement.id)}>➕</button>
                    <button
                      onClick={() => removeOption(selectedElement.id)}
                      disabled={selectedElement.variables.length <= 1}
                    >➖</button>
                </div>
              )}
            </div>
          ) : (
            <p className="no-element-selected">請在架構編輯區選擇一個元素來編輯其變數</p>
          )}
        </div>
      </div>

      {/* 區塊4: 最終輸出的提示展示區 */}
      <div className="card final-prompt-area">
        <h2 className="section-title">最終提示詞輸出</h2>
        <textarea
          value={finalPrompt}
          readOnly
          className="final-prompt"
        />
        <div className="button-container">
            <button 
              onClick={copyToClipboard}
              className={copyStatus === '已複製！' ? 'success' : copyStatus === '複製失敗' ? 'error' : ''}
            >
              {copyStatus}
            </button>
            <button onClick={resetToDefault} className="secondary">
              回到預設值
            </button>
        </div>
      </div>
      {isTooltipVisible && (
      <div
        className="custom-tooltip"
          style={{
            position: 'fixed',
            left: `${tooltipPosition.x + 10}px`,
            top: `${tooltipPosition.y + 10}px`,
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '4px',
            fontSize: '12px',
            pointerEvents: 'none'
          }}
        >
          {tooltipContent}
        </div>
      )}

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <p>&copy; 2024 <a href="https://erikyin.net/" target="_blank">殷慈遠的字碼世界</a>. All rights reserved.</p>
          <p>參考資訊：<a href="https://docs.anthropic.com/zh-TW/docs/prompt-engineering" target="_blank">提示工程 - Anthropic</a></p>
          <p>♥ Love it? ★ <a href="https://erikyin.net/boost/" target="_blank">Support me!</a>
</p>
        </div>
      </footer>
    </div>
  );
};

// 渲染 React 組件
const rootElement = document.getElementById('root');
ReactDOM.render(React.createElement(PromptGenerator), rootElement);