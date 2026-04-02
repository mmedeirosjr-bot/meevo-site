let data = JSON.parse(localStorage.getItem('meevo_real')||'[]')

function salvar(){
let e={
paciente:paciente.value,
sexo:sexo.value,
geral:geral.value,
an:an.value,
ar:ar.value,
acv:acv.value,
abd:abd.value,
ext:ext.value,
conduta:conduta.value,
data:new Date().toLocaleString()
}
data.unshift(e)
localStorage.setItem('meevo_real',JSON.stringify(data))
render()
}

function duplicar(){
if(!data.length)return
let e=data[0]
paciente.value=e.paciente
conduta.value=e.conduta
}

function exportar(){
let txt=data.map(e=>`${e.paciente}
${e.geral}
${e.an}
${e.ar}
${e.acv}
${e.abd}
${e.ext}
Conduta: ${e.conduta}
`).join("
")
let blob=new Blob([txt])
let a=document.createElement('a')
a.href=URL.createObjectURL(blob)
a.download="evolucao.txt"
a.click()
}

function render(){
lista.innerHTML=""
data.forEach(e=>{
let d=document.createElement('div')
d.innerText=e.paciente+" - "+e.data
lista.appendChild(d)
})
}

render()
