const select_item=(element)=>{const parent_element=element.parentElement;const brother_elements=Array.from(parent_element.children);brother_elements.map((item)=>item.classList.remove('active'));element.classList.add('active');};