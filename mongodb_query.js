db.getCollection('Users').aggregate(
    [
       { $project: { 
          email: "$email"  ,
          fullname: { $concat: [ "$th_firstname", " - ", "$th_lastname" ] } ,
          age: "$age"
       }},
       { 
         $match: { 
          email: "kongsanais@gmail.com",
          $or: [ { age: "19" } ]
       }},
    ]
 )
       