const progress_requalification=new ProgressBar.SemiCircle('.requalification .progress',{strokeWidth:6,color:'#4A4D99',trailColor:'#F7F7FF',trailWidth:6,easing:'easeInOut',duration:1400,svgStyle:null,text:{value:'',alignToBottom:false},from:{color:'#4A4D99'},to:{color:'#4A4D99'},step:(state,bar)=>{bar.path.setAttribute('stroke',state.color);var value=Math.round(bar.value()*100);if(value===0){bar.setText('');}else{bar.setText(value);}
bar.text.style.color=state.color;}});const data_progress_req=document.querySelector('.requalification .progress').getAttribute('data-progress');const progress_req=data_progress_req/100;progress_requalification.animate(progress_req);const progress_next_level=new ProgressBar.SemiCircle('.next-level .progress',{strokeWidth:6,color:'#A03D8C',trailColor:'#F7F7FF',trailWidth:6,easing:'easeInOut',duration:1400,svgStyle:null,text:{value:'',alignToBottom:false},from:{color:'#A03D8C'},to:{color:'#A03D8C'},step:(state,bar)=>{bar.path.setAttribute('stroke',state.color);var value=Math.round(bar.value()*100);if(value===0){bar.setText('');}else{bar.setText(value);}
bar.text.style.color=state.color;}});const data_progress_nl=document.querySelector('.next-level .progress').getAttribute('data-progress');const progress_nl=data_progress_nl/100;progress_next_level.animate(progress_nl);