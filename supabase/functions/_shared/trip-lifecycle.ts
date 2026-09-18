export async function isArchivedTrip(db:any,tripId:string){
  const {data,error}=await db.from('owner_trip_lifecycle').select('state').eq('trip_id',tripId).maybeSingle()
  if(error)throw error
  return data?.state==='archived'
}

export async function assertTripActive(db:any,tripId:string,message='This trip has been archived.'){
  if(await isArchivedTrip(db,tripId)){
    const error:any=new Error(message)
    error.code='TRIP_ARCHIVED'
    throw error
  }
}
