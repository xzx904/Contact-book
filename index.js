var express = require('express');
var router = express.Router();
var connection = require('../db/sql.js')


const getAccountId = async (name) => {
	const sql = 'select * from xzx where name = ?'
	let res = await connection.sqlConnection(sql, [name])
	if(res[0]){
		return res[0].id
	}else{
		return false
	}
}


//获取用户的通讯录
router.get('/getAddressBook', async function(req, res, next) {
	let sql = 'select * from xzx'
	let contacts = await connection.sqlConnection(sql, [])
	res.json(contacts);  
});

//删除用户的通讯录
router.post('/deleteAddressBook', async function(req, res, next) {
	let id = req.body.id
	// let id = await getAccountId(name)
	console.log(id)
	let sql = 'delete from xzx where id = ?'
	let addressBook = await connection.sqlConnection(sql, [id])
	res.send(addressBook)
});

//增加用户通讯录信息
router.post('/addAddressBook', async function(req, res, next) {
	let name = req.body.name
	let email = req.body.email
	let phone = req.body.phone
	let id = await getAccountId(name)
	console.log(name)
	console.log(id)
	if(id == false){
		let sql = 'INSERT IGNORE INTO xzx (name,email,phone) values (?,?,?)'
		let report = await connection.sqlConnection(sql, [name,email,phone])
		res.send(report)
	}else{
		let sql = 'update xzx set phone = ?,name = ?,email = ? where id = ?'
		let report = await connection.sqlConnection(sql, [phone,name,email,id])
		res.send(report)
	}

});

module.exports = router;