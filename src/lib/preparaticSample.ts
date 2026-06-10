export const preparaticSample = `window.__PREPARATIC_TEST__={
  id:"gsi-a2-opposition-sample",
  title:"GSI A2 opposition sample",
  questions:[
    {
      id:"q-001",
      text:"Which option is marked as correct with minified JavaScript truthiness?",
      block:"Sample block",
      topic:"Parsing",
      year:2026,
      exam:"GSI A2",
      answers:[
        {letter:"A",answer:"This option uses right: !1",right:!1},
        {letter:"B",answer:"This option uses right: !0",right:!0},
        {letter:"C",text:"This option uses the text field",right:false},
        {letter:"D",answer:"This option is also incorrect",right:!1}
      ]
    },
    {
      id:"q-002",
      text:"Which answer text field name should the parser accept?",
      answers:[
        {letter:"A",text:"Only answer",right:false},
        {letter:"B",answer:"Both answer and text",right:true},
        {letter:"C",text:"Neither field",right:false},
        {letter:"D",answer:"No fields are required",right:false}
      ]
    }
  ]
};`;
