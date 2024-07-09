const express = require('express')
const app = express()

const path = require('path')
const publicPath = path.join(__dirname,'public')

const con = require('./config')

app.use(express.json())
app.use(express.static(publicPath))

app.get('', (req,resp) => {
    resp.sendFile(path.join(publicPath,'index.html'))
})

app.get('/driver', (req, resp)=>{
    resp.sendFile(path.join(publicPath,'DriverLogin','driverlogin.html'))
})

app.get('/admin', (req,resp)=>{
    resp.sendFile(path.join(publicPath, 'AdminLogin','adminlogin.html'))
})

app.get('/*', (req,resp)=>{
    resp.sendFile(path.join(publicPath,'Error','error.html'))
})


app.post('/api/login', (req,resp)=>{
    const receivedData = req.body
    con.query('select * from customer where custID = ? and pass = md5(?)',[receivedData.name, receivedData.password],(error, result)=>{
        if(error){
            console.log(error)
        }else{
            console.log(result)
            if (result.length){
                resp.json({message: 'Success', data: true})
            }else{
                resp.json({message: 'Success', data: false})
            }
        }
    })
})

app.post('/api/Driverlogin', (req,resp)=>{
    const receivedData = req.body
    console.log(receivedData)
    con.query('select * from driver where driverID = ? and pass = md5(?)',[receivedData.name, receivedData.password],(error, result)=>{
        if(error){
            console.log(error)
        }else{
            console.log(result)
            if (result.length){
                resp.json({message: 'Success', data: true})
            }else{
                resp.json({message: 'Success', data: false})
            }
        }
    })
})

app.post('/api/Adminlogin', (req,resp)=>{
    const receivedData = req.body
    console.log(receivedData)
    con.query('select * from admins where ID = ? and pass = ?',[receivedData.name, receivedData.password],(error, result)=>{
        if(error){
            console.log(error)
        }else{
            if (result.length){
                resp.json({message: 'Success', data: true})
            }else{
                resp.json({message: 'Success', data: false})
            }
        }
    })
})

app.post('/api/verifyEmail', (req,resp)=>{
    const receivedData = req.body
    con.query('select * from customer where email=?',receivedData.email,(error, result)=>{
        if(error){
            console.log(error)
        }else{
            console.log('Email: ',result)
            if (!result.length){
                resp.json({message: 'Success', data: true})
            }else{
                resp.json({message: 'Success', data: false})
            }
        }
    })
})

app.post('/api/verifyPhone', (req,resp)=>{
    const receivedData = req.body
    con.query('select * from PhoneNo_customer where PhoneNo=?',receivedData.phone,(error, result)=>{
        if(error){
            console.log(error)
        }else{
            console.log('Phone: ',result)
            if (!result.length){
                resp.json({message: 'Success', data: true})
            }else{
                resp.json({message: 'Success', data: false})
            }
        }
    })
})

app.post('/api/verifyAltPhone', (req,resp)=>{
    const receivedData = req.body
    con.query('select * from PhoneNo_customer where PhoneNo=?',receivedData.altPhone,(error, result)=>{
        if(error){
            console.log(error)
        }else{
            console.log('Alt Phone: ',result)
            if (!result.length){
                resp.json({message: 'Success', data: true})
            }else{
                resp.json({message: 'Success', data: false})
            }
        }
    })
})

app.post('/api/verifyNIC', (req,resp)=>{
    const receivedData = req.body
    con.query('select * from indi_customer where NIC=?',receivedData.NIC,(error, result)=>{
        if(error){
            console.log(error)
        }else{
            console.log('NIC: ',result)
            if (!result.length){
                resp.json({message: 'Success', data: true})
            }else{
                resp.json({message: 'Success', data: false})
            }
        }
    })
})

app.post('/api/verifyFaxNo', (req,resp)=>{
    const receivedData = req.body
    console.log(receivedData)
    con.query('select * from PhoneNo_customer where PhoneNo=?',receivedData.fax,(error, result)=>{
        if(error){
            console.log(error)
        }else{
            console.log(result)
            if (!result.length){
                resp.json({message: 'Success', data: true})
            }else{
                resp.json({message: 'Success', data: false})
            }
        }
    })
})

app.post('/api/verifyCompany', (req,resp)=>{
    const receivedData = req.body
    console.log(receivedData)
    con.query('select * from comp_customer where CompName=?',receivedData.CompName,(error, result)=>{
        if(error){
            console.log(error)
        }else{
            console.log(result)
            if (!result.length){
                resp.json({message: 'Success', data: true})
            }else{
                resp.json({message: 'Success', data: false})
            }
        }
    })
})

app.post('/api/addCustomer', (req,resp)=>{
    const receivedData = req.body
    const query = `SET @cr_seq_value = null;
    CALL seq_next_value('cr_sequence', @cr_seq_value);
    SELECT @cr_seq_value`

    con.query(query, (error, result)=> {
        if(error){
            resp.send('error')
        }else{
            const id = result[2][0]['@cr_seq_value']
            console.log('ID is:',id)
            con.query('INSERT INTO customer(custID,pass,email,address,userType) values (?,md5(?),?,?,?)',
                [id, receivedData.password, receivedData.email, receivedData.address, receivedData.userType],
                (error, result)=>{
                    if(error){
                        console.log(error)
                    }else{
                        console.log('Result is: ',result)
                        resp.send({message: 'Success', custID: id})
                    }
                }
            )
        }
    })
})

app.post('/api/addIndicustomer', (req,resp)=>{
    const receivedData = req.body
    con.query('INSERT INTO indi_customer(NIC, FirstName, LastName, custID) values (?,?,?,?)',
        [receivedData.NIC, receivedData.FirstName, receivedData.LastName, receivedData.custID], (error, result)=>{
                if(error){
                    console.log(error)
                }else{
                    console.log(result)
                }
            })
})

app.post('/api/addPhoneNo', (req,resp)=>{
    const receivedData = req.body
    con.query('INSERT INTO PhoneNo_customer(custID, PhoneNo) values (?,?)',[receivedData.custID, receivedData.Phone], (error, result)=>{
        if(error){
            console.log(error)
        }else{
            console.log(result)
        }
    })

    if(receivedData.Alternate){
        con.query('INSERT INTO PhoneNo_customer(custID, PhoneNo) values (?,?)',[receivedData.custID, receivedData.Alternate], (error, result)=>{
            if(error){
                console.log(error)
            }else{
                console.log(result)
            }
        })       
    }
})

app.post('/api/addCompcustomer', (req,resp)=>{
    const receivedData = req.body
    con.query('INSERT INTO comp_customer(CompName, Focal_person, custID) values (?,?,?)',
        [receivedData.compName, receivedData.FocalPerson, receivedData.custID], (error, result)=>{
                if(error){
                    console.log(error)
                }else{
                    console.log(result)
                }
            })
})

app.post('/api/addCompPhoneNo', (req,resp)=>{
    const receivedData = req.body
    con.query('INSERT INTO PhoneNo_customer(custID, PhoneNo) values (?,?)',[receivedData.custID, receivedData.Phone], (error, result)=>{
        if(error){
            console.log(error)
        }else{
            console.log(result)
        }
    })

    if(receivedData.Fax){
        con.query('INSERT INTO PhoneNo_customer(custID, PhoneNo) values (?,?)',[receivedData.custID, receivedData.Fax], (error, result)=>{
            if(error){
                console.log(error)
            }else{
                console.log(result)
            }
        })       
    }
})

app.post('/api/trackPackage', (req, resp)=>{
    const receivedData = req.body
    con.query('select * from track_pk_view where packageID = ?',[receivedData.packageID], (error, result)=>{
        if(error){
            console.log(error)
        }else{
            console.log(result)
            resp.send({status: result.length != 0, data: result})
        }
    })
})

app.post('/api/getCustomerName', (req, resp) =>{
    const receivedData = req.body
    con.query('select userType from customer where custID = ?', [receivedData.custID], (error, result)=>{
        if(error){
            console.log(error)
        }
        else{
            const userType = result[0].userType
            if(userType=='individual'){
                con.query('select FirstName from indi_customer where custID = ?', [receivedData.custID], (error, result)=>{
                    if(error){
                        console.log(error)
                    }else{
                        resp.send({userType:userType, data: result[0].FirstName })
                    }
                })
            }
        }
    })
})
app.listen(5000)
