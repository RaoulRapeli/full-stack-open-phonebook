import { useState } from 'react'
import { useEffect } from 'react'
import phoneServices from "./services/persons"
import "./style.css"

const Contact = ({person,handleDelete}) =>{
  return(
    <div>
      {person.name} {person.number} <button onClick={() => handleDelete(person.id,person.name)} >delete</button>
    </div>
  )
}

const Contacts = ({persons,newFilter,handleDelete}) =>{
  return (
    <>
      {persons.filter((p)=>p.name.toLowerCase().includes(newFilter.toLowerCase())).map((person, i)=> 
        <Contact key={person+i} person={person} handleDelete={handleDelete}/>
      )}
    </>
  )
}

const Filter = ({newFilter,chngeFilter}) =>{

  return (
    <>
      <input value={newFilter} onChange={chngeFilter}/>
    </>
  )
}

const PersonsForm = ({newName, newNumber, chngeName, chngeNumber, handleSubmit}) =>{
  return (
    <>
      <form>
        <div>
          <h2>add new</h2>
        </div>
        <div>
          name: <input value={newName} onChange={(e)=> chngeName(e)}/>
        </div>
        <div>
          number: <input value={newNumber} onChange={(e)=> chngeNumber(e)}/>
        </div>
        <div>
          <button type="submit" onClick={(e)=> handleSubmit(e)}>add</button>
        </div>
      </form>
    </>
  )
}

const Notification = ({ message, messageType}) => {
  if (message === null) {
    return null
  }
  const getMessageStyle = () => {
    switch(messageType) {
      case 'Sucess':
        return {color:"green"};
      case 'Error':
        return {color:"red"};
      default:
        return {color:"orange"};
    }
  }
  
  const messageStyle = getMessageStyle()

  return (
    <div className="error" style={messageStyle}>
      {message}
    </div>
  )
}

const App = () => {

  const [persons, setPersons] = useState([])
  const [message, setMessage] = useState()
  const [messageType, setMessageType] = useState("")

  useEffect(() => {
    phoneServices
    .getAll()
      .then(response => {
        setPersons(response)
      })
  }, [])


  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [newFilter, setNewFilter] = useState('')

  const chngeName = (event) => {
    let name = event.target.value
    setNewName(name)
  }

  const chngeNumber = (event) => {
    let number = event.target.value
    setNewNumber(number)
  }

  const chngeFilter = (event) => {
    let filterValue = event.target.value
    setNewFilter(filterValue)
  }

  const handleSubmit = (event) =>{
    event.preventDefault()

    let findPerson = persons.find((person) => person.name === newName)
    if(findPerson===undefined){
      phoneServices.create({name:newName,number:newNumber})
      .then(response => {
        let newPerson = persons.concat(response)
        setPersons(newPerson)
        setNewName("")
        setNewNumber("")
        handleMessage(`Added ${newName}`,"Sucess")
      })
      .catch((error) => {
        console.log(error)
        handleMessage(`${error.response.data.error}`,"Error")
      })
     
    }
    else{
      if (window.confirm(`${newName} is already added to phonebook, replace the old number with new one ?`)) {
        phoneServices.update(findPerson.id,{number:newNumber, name:findPerson.name})
        .then(response => {
          setPersons(persons.map(person => person.id !== findPerson.id ? person : response))
          setNewName("")
          setNewNumber("")
          handleMessage(`Updated ${newName} phone number`,"Sucess")
        })
        .catch((reason) => {
          handleMessage(`Information of ${newName} has alredy been removed from server`,"Error")
        })
      }
    }
    
  }

  const handleDelete = (id,personName) => {
    if (window.confirm(`Delete  ${personName} ?`)) {
      phoneServices.removeContact(id)
      .then(response => {
        let removePerson = persons.filter((person) => person.id !== id)
        setPersons(removePerson)
        handleMessage(`Deleted ${personName}`,"Sucess")
      })
      .catch((reason) => {
        handleMessage(`Information of ${personName} has alredy been removed from server`,"Error")
      })
    }
  }
  
  const handleMessage = (message,type) => {
    setMessage(message)
    setMessageType(type)
    setTimeout(() => {
      setMessage(null)
    }, 2000)
  }

  return (
    <div>
      <h2>Phonebook</h2>
      {message?
        <Notification message={message} messageType={messageType}/>
        :
        null
      }
      <div>
          filter shown with: <Filter newFilter={newFilter} chngeFilter={(e) => chngeFilter(e)}/>
      </div>
      <PersonsForm {...{newName,newNumber,chngeName,chngeNumber,handleSubmit}}/>
      <h2>Numbers</h2>
      <Contacts {...{persons, newFilter, handleDelete}}/>
    </div>
  )
}

export default App