let data = JSON.parse(localStorage.getItem('meevo_v8')||'[]')

function salvar(){
let evo = {
paciente: paciente.value,
sexo: sexo.value,
consciencia: consciencia.value,
ar: ar.value,
acv: acv.value,
abd: abd.value,
ext: ext.value,
conduta: conduta.value,
data: new Date().toLocaleString()
}
data.unshift(evo)
localStorage.setItem('meevo_v8', JSON.stringify(data))
render()
}

function duplicar(){
if(data.length==0) return
let e=data[0]
paciente.value=e.paciente
conduta.value=e.conduta
}

function exportar(){
let texto=""
data.forEach(e=>{
texto+=e.paciente+"\n"+e.conduta+"\n\n"
})
let blob=new Blob([texto])
let a=document.createElement('a')
a.href=URL.createObjectURL(blob)
a.download="meevo.txt"
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
