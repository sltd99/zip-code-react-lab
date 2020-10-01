import React, { Component } from "react"
import "./App.css"
import { Container, Row, Col } from "react-bootstrap"
import { Form, Card } from "react-bootstrap"

function City(props) {
    return (
        <Row className="justify-content-center">
            <Card style={{ width: "20rem" }}>
                <Card.Body>
                    <Card.Title>{props.zipCode}</Card.Title>
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

function State(props) {
    return (
        <Row className="justify-content-center">
            <Card style={{ width: "20rem" }}>
                <Card.Header>{props.state}</Card.Header>
                {props.cities.map((city, index) => (
                    <City key={index} {...city} />
                ))}
            </Card>
        </Row>
    )
}

function States(props) {
    return Object.keys(props.zipCodesGroupedByState).map((state, index) => (
        <State
            key={index}
            state={state}
            cities={props.zipCodesGroupedByState[state]}
        />
    ))
}

const handleCitySearch = async (e, setzipCodesGroupedByState) => {
    e.preventDefault()

    const cityName = e.target.elements["city-name"].value

    if (!cityName) return

    try {
        const response = await fetch(
            `http://ctp-zip-api.herokuapp.com/city/${cityName.toUpperCase()}`
        )

        const zipCodes = await response.json()

        const cities = await Promise.all(
            zipCodes.map(async zipCode => {
                const response = await fetch(
                    `http://ctp-zip-api.herokuapp.com/zip/${zipCode}`
                )

                return await response.json()
            })
        )

        const zipCodesWithCityDetails = cities.map(city => ({
            zipCode: city[0].Zipcode,
            state: city[0].State,
            lat: city[0].Lat,
            long: city[0].Long,
            population: city[0].EstimatedPopulation || "Unknown",
            wages: city[0].TotalWages || "Unknown",
        }))

        const zipCodesGroupedByState = {}
        zipCodesWithCityDetails.forEach(city => {
            if (!zipCodesGroupedByState.hasOwnProperty(city.state))
                zipCodesGroupedByState[city.state] = []

            zipCodesGroupedByState[city.state].push(city)
        })

        setzipCodesGroupedByState(zipCodesGroupedByState)
    } catch (e) {
        console.log(e)
        return
    }
}

function CitySearchField(props) {
    return (
        <Row className="justify-content-center">
            <Form
                onSubmit={e => {
                    handleCitySearch(e, props.setzipCodesGroupedByState)
                }}
            >
                <Form.Group as={Row}>
                    <Form.Label column xs="auto">
                        City Name:
                    </Form.Label>
                    <Col xs={8}>
                        <Form.Control name="city-name" />
                    </Col>
                </Form.Group>
            </Form>
        </Row>
    )
}

class App extends Component {
    state = {
        zipCodesGroupedByState: {},
    }

    render() {
        return (
            <div className="App">
                <div className="App-header">
                    <h2>City Name Search</h2>
                </div>
                <Container>
                    <CitySearchField
                        setzipCodesGroupedByState={zipCodesGroupedByState =>
                            this.setState({ zipCodesGroupedByState })
                        }
                    />

                    <States
                        zipCodesGroupedByState={
                            this.state.zipCodesGroupedByState
                        }
                    />
                </Container>
            </div>
        )
    }
}

export default App
