import React, { Component } from "react"
import "./App.css"
import { Container, Row, Col } from "react-bootstrap"
import { Form, Card } from "react-bootstrap"

function City(props) {
    return (
        <Row className="justify-content-center">
            <Card style={{ width: "20rem" }}>
                <Card.Body>
                    <Card.Title>
                        {props.city}, {props.state}
                    </Card.Title>
                    <ul>
                        <li>State: {props.state}</li>
                        <li>
                            Location: ({props.lat}, {props.long})
                        </li>
                        <li>Population (estimated): {props.population}</li>
                        <li>Total Wages: {props.wages}</li>
                    </ul>
                </Card.Body>
            </Card>
        </Row>
    )
}

function Cities(props) {
    return props.cities.map((city, index) => <City key={index} {...city} />)
}

const handleZipSearch = async (e, setCities) => {
    e.preventDefault()

    const zipCode = e.target.elements["zip-code"].value

    if (!zipCode) return

    try {
        const response = await fetch(
            `http://ctp-zip-api.herokuapp.com/zip/${zipCode}`
        )

        const rawCityData = await response.json()

        console.log(rawCityData)

        const cities = rawCityData.map(cityData => ({
            city: cityData.City,
            state: cityData.State,
            lat: cityData.Lat,
            long: cityData.Long,
            population: cityData.EstimatedPopulation || "Unknown",
            wages: cityData.TotalWages || "Unknown",
        }))

        setCities(cities)
    } catch {
        return
    }
}

function ZipSearchField(props) {
    return (
        <Row className="justify-content-center">
            <Form
                onSubmit={e => {
                    handleZipSearch(e, props.setCities)
                }}
            >
                <Form.Group as={Row}>
                    <Form.Label column xs="auto">
                        Zip Code:
                    </Form.Label>
                    <Col xs={5}>
                        <Form.Control name="zip-code" maxLength={5} />
                    </Col>
                </Form.Group>
            </Form>
        </Row>
    )
}

class App extends Component {
    state = {
        cities: [],
    }

    render() {
        return (
            <div className="App">
                <div className="App-header">
                    <h2>Zip Code Search</h2>
                </div>
                <Container>
                    <ZipSearchField
                        setCities={cities => this.setState({ cities })}
                    />
                    <Cities cities={this.state.cities} />
                </Container>
            </div>
        )
    }
}

export default App
