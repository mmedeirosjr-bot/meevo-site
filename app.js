let data = JSON.parse(localStorage.getItem('meevo')||'[]')

function salvar(){
let evo = {
paciente: document.getElementById('paciente').value,
setor: document.getElementById('setor').value,
geral: document.getElementById('geral').value,
an: document.getElementById('an').value,
ar: document.getElementById('ar').value,
acv: document.getElementById('acv').value,
conduta: document.getElementById('conduta').value,
data: new Date().toLocaleString()
}
data.unshift(evo)
localStorage.setItem('meevo', JSON.stringify(data))
render()
}

function duplicar(){
if(data.length===0) return
let last = data[0]
document.getElementById('paciente').value = last.paciente
document.getElementById('conduta').value = last.conduta
}

function exportar(){
let texto = document.body.innerText
let blob = new Blob([texto], {type:'text/plain'})
let url = URL.createObjectURL(blob)
let a = document.createElement('a')
a.href = url
a.download = 'evolucao.txt'
a.click()
}

function render(){
let div = document.getElementById('lista')
div.innerHTML=''
data.forEach(e=>{
let d = document.createElement('div')
d.innerText = e.paciente + ' - ' + e.data
div.appendChild(d)
})
}

render()
