const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Random Number Unit Tests", function () {
        let randomNumber, deployer, vrfCoordinatorV2Mock

        beforeEach(async () => {
            accounts = await ethers.getSigners()
            deployer = accounts[0]
            await deployments.fixture(["mocks", "randomnumber"])
            randomNumber = await ethers.getContract("RandomNumber")
            vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        })

        describe("should request a random number", async() => {
            it("should request a random number", async function () {
                // const transaction = await randomNumber.requestRandomWords()
                // await transaction.wait()
                // const lastRequestId = await randomNumber.lastRequestId()
                // console.log(lastRequestId)
                // const theRandomNumber = await randomNumber.s_requests(parseInt(lastRequestId))
                // console.log(theRandomNumber.toString()) 
                await new Promise(async (resolve, reject) => {
                    try {
                        const requestNftResponse = await randomNumber.requestRandomWords()
                        const requestNftReceipt = await requestNftResponse.wait(1)
                        await vrfCoordinatorV2Mock.fulfillRandomWords(
                            requestNftReceipt.events[1].args.requestId,
                            randomNumber.address
                        )
                    } catch (e) {
                        console.log(e)
                        reject(e)
                    }
                    randomNumber.once("RequestFulfilled", async () => {
                        try {
                            //Get the random number there
                            const lastRequestId = await randomNumber.lastRequestId()
                            const theRandomNumber = await randomNumber.s_requests(parseInt(lastRequestId))
                            console.log(theRandomNumber.toString()) 
                            resolve()
                        } catch (e) {
                            console.log(e)
                            reject(e)
                        }
                    })
                    
                })
               
            })
        })
    })