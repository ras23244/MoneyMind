const httpAction=async (data)=>{
    try{
        const response = await fetch(data.url, {
            method: data.method || 'GET',
            body: data.body ? JSON.stringify(data.body) : null,
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        })

        const result = await response.json();
        if(!response.ok) {
            throw new Error(result.message || 'Unknown error');
        }
        return result;
    }
    catch(err){
        console.error("Error in HTTP Action:", err);
    }
}

export default httpAction;