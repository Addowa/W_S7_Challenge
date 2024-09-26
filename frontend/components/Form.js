import React, { useEffect, useState } from 'react'
import * as Yup from 'yup'
import axios from 'axios'

// 👇 Here are the validation errors you will use with Yup.
const validationErrors = {
  fullNameTooShort: 'full name must be at least 3 characters',
  fullNameTooLong: 'full name must be at most 20 characters',
  sizeIncorrect: 'size must be S or M or L'
}

// 👇 Here you will create your schema.
const schema = Yup.object().shape({
  fullName: Yup.string()
    .min(3, validationErrors.fullNameTooShort)
    .max(20, validationErrors.fullNameTooLong)
    .required('Full name is required'),
  size: Yup.string()
    .oneOf(['S', 'M', 'L'], validationErrors.sizeIncorrect)
    .required('Size is required'),
  toppings: Yup.array().of(Yup.string()).required('At least one topping is required'),
})

// 👇 This array could help you construct your checkboxes using .map in the JSX.
const toppings = [
  { topping_id: '1', text: 'Pepperoni' },
  { topping_id: '2', text: 'Green Peppers' },
  { topping_id: '3', text: 'Pineapple' },
  { topping_id: '4', text: 'Mushrooms' },
  { topping_id: '5', text: 'Ham' },
]

const sizeMapping = {
  Small: "S",
  Medium: "M",
  Large: "L",
}

export default function Form() {
  const [fullName, setFullName] = useState('')
  const [size, setSize] = useState('')
  const [selectedToppings, setSelectedToppings] = useState([])
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isValid, setIsValid] = useState(false)
  const [touched, setTouched] = useState({fullName: false, size: false, toppings: false})

  const sizes = ['Small', 'Medium', 'Large']

  useEffect(() => {
    const validateForm = async () => {
      try {
        await schema.validate({
           fullName: fullName.trim(), 
           size: sizeMapping[size],
           toppings: selectedToppings.length > 0 ? selectedToppings: [], 
        })
        setIsValid(true)
      } catch (err) {
        setIsValid(false)
      }
    }
    validateForm();
  }, [fullName, size, selectedToppings]) 

  const handleInputChange = (e) => {
    const value = e.target.value.trim()
    setFullName(value)
    setTouched({ ...touched, fullName: true })
  }
  
  
  const handleSizeChange = (e) => {
    setSize(e.target.value)
    setTouched({ ...touched, size: true })
  }

  const handleToppingChange = (e) => {
    const { value, checked } = e.target
    if (checked) {
      setSelectedToppings([...selectedToppings, value])
    } else {
      setSelectedToppings(selectedToppings.filter(topping => topping !== value))
    }
    setTouched({ ...touched, toppings: true })
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('')
    setSuccessMessage('')
    try {
      await schema.validate({
        fullName,
        size: sizeMapping[size],
        toppings: selectedToppings.length > 0 ? selectedToppings: [],
      }) 
      const toppingIDs = selectedToppings.map(topping => {
        const toppingObj = toppings.find(t => t.text === topping)
        return toppingObj ? toppingObj.topping_id : null
      }).filter(id => id !== null)

      const abbreviatedSize = sizeMapping[size]

      const orderData = {
        fullName,
        size: abbreviatedSize,
        toppings: toppingIDs,
      }
  
      const response = await axios.post('http://localhost:9009/api/order', orderData)
      
      if (response.status === 200 || response.status === 201) {
        setSuccessMessage(response.data.message)
        setFullName('')
        setSize('')
        setSelectedToppings([])
        setIsValid(false)
        setTouched({ fullName: false, size: false, toppings: false })
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Something went wrong. Please try again.')
      } else {
        setError('Something went wrong. Please try again.')
      }
      setIsValid(false)
    }
    
  }

  return (
    <form onSubmit={handleSubmit} >
      <h2>Order Your Pizza</h2>
      {successMessage && <div className='success'>{successMessage}</div>}
      {error && <div className='error'>{error}</div>}

      <div className="input-group">
        <div>
          <label htmlFor="fullName">Full Name</label><br />
          <input placeholder="Type full name" id="fullName" type="text" value={fullName} onChange={handleInputChange} />
        </div>
          {touched.fullName && fullName.length < 3 && <div className='error'>{validationErrors.fullNameTooShort}</div>}
          {touched.fullName && fullName.length > 20 && <div className='error'>{validationErrors.fullNameTooLong}</div>}
      </div>

      <div className="input-group">
        <div>
          <label htmlFor="size">Size</label><br />
          <select id="size" value={size} onChange={handleSizeChange}>
            <option value="">----Choose Size----</option>
            {/* Fill out the missing options */}
            {sizes.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
          {touched.size && !size && <div className='error'>{validationErrors.sizeIncorrect}</div>}
        </div>

      <div className="input-group">
        {/* 👇 Maybe you could generate the checkboxes dynamically */}
        {toppings.map(topping => (
        <label key={topping.topping_id}>
          <input
            name="toppings"
            type="checkbox"
            value={topping.text}
            checked={selectedToppings.includes(topping.text)}
            onChange={handleToppingChange}
          />
          {topping.text}<br />
        </label>
        ))}
      </div>
      {/* 👇 Make sure the submit stays disabled until the form validates! */}
      <input type="submit" disabled={!isValid} value="Submit"/>
    </form>
  )
}
