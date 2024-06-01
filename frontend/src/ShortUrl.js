import React, {useState, useEffect} from 'react';
import "./Styles.css";
import { v4 } from 'uuid';
import Delete from './icons/Delete';
import Copy from './icons/Copy';
import Clear from './icons/Clear';

import { Snackbar, SnackbarContent} from '@mui/material';


const vertical = 'bottom';
const horizontal = 'center';
const myDomain = "http://localhost:4000/";

export default function ShortUrl() {
    let sUrl;
    const [shortenedUrl, setShortenedUrl] = useState('');
    const [largeUrl, setLargeUrl] = useState('');
    const [popup, setPopup] = useState(false);
    const [invalidUrl, setInvalidUrl] = useState(false);

    const [urlsList, setUrlsList] = useState([]);

    const addNewUrl = (sUrl) => {
        
        
        const sendData =  {
            mainUrl: largeUrl,
            newUrl: sUrl
        };
        fetch("/api/addUrl", {
            method: "POST",
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(sendData)
        })
        .then(response => {
            if (response.ok){
                return response.json();
            } else {
                return response.json().then((data) => {
                    throw new Error(data.error);
                  });
            }
        })
        .then(json => {
            setUrlsList(json.reverse());
            setShortenedUrl(sUrl);
        })
        .catch(error => {
            console.log("Add url error: ", error);
        })
    }

    const getShorternedUrl = () => {
        let testUrl;
        try {
            testUrl = new URL(largeUrl);
        } catch(error){
            console.log(error)
        }
        if(!testUrl){
            setInvalidUrl(true)
            return;
        } 
        sUrl =  myDomain + v4().slice(0, 13);
        addNewUrl(sUrl);
          
    }
    
    const handleKeyDown = (event) => {
        if (event.key === "Enter"){
            getShorternedUrl();
        }
    }

    const copyToClipBoard = () => {
        navigator.clipboard.writeText(shortenedUrl);
    }

    const initialFetchUrls = () => {
        fetch("/api/urls")
        .then(response => response.json())
        .then(json => {
            setUrlsList(json.reverse());
        })
        .catch(error => {
            console.log("Url Fetch Error: ", error);
        })
    }

    useEffect(()=> {
        initialFetchUrls();
    }, []);

    const handleDeleteUrl = (shrtUrl) => {
        const sendUrl = shrtUrl.slice(22);
        fetch(`/api/delete/${sendUrl}`, {
            method: "DELETE",
            headers: {
                'Content-type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(json => {
            setUrlsList(json.reverse());
        })
        .catch(error => {
            console.log("Delete Error: ", error);
        });
    }
    

  return (
    <div className="w-screen h-screen flex flex-col gap-4 items-center justify-start py-8 bg-main">
        <div className='w-11/12 sm:w-8/12 flex flex-col items-center max-h-screen overflow-y-auto
        rounded-sm border-mui-blue py-8 gap-6 box-shadow bg-darkblue'>
            <header className='text-lg font-medium text-white'>Paste your url to shorten</header>

            <div className='flex w-10/12 justify-center'>
                <input 
                className='w-9/12 outline-none px-2 h-8 rounded-s-sm text-sm'
                onChange={(event) => {setLargeUrl(event.target.value)}}
                onKeyDown={handleKeyDown}
                value={largeUrl}
                />
                <button
                className='w-3/12 bg-lightgreen text-white font-medium text-sm'
                onClick={getShorternedUrl}
                >Shorten</button>
                <button className='w-8 h=8 px-2 bg-lightred text-white rounded-e-sm
                flex items-center justify-center'
                onClick={ () => {setLargeUrl('');
                setShortenedUrl('')}}>
                    <Clear />
                </button>
            </div>

            {shortenedUrl.length !== 0 && 
            <div  className='flex w-10/12 justify-center'>
            
                <p className='w-9/12 bg-gray-200 h-8 overflow-x-auto px-2 rounded-s-sm border border-gray-300 text-xs
                flex items-center'>
                {shortenedUrl}
                </p>

                <button
                className='w-3/12 bg-lightred text-white font-medium text-sm rounded-e-sm'
                onClick={()=> {
                    copyToClipBoard();
                    setPopup(true);
                }}
                >Copy</button>
            </div>   
            }
        </div>
        {urlsList.length > 0 && 
        <div className='w-11/12 sm:w-8/12 flex flex-col items-center max-h-80 overflow-y-auto
        rounded-sm border-mui-blue py-8 gap-6 box-shadow bg-darkblue text-white'>
            <div className='w-full h-6 flex justify-between items-center text-sm'>
                <span className='w-2/12 sm:w-1/12 h-full  flex justify-center'>Sl no</span>
                <span className='w-5/12 h-full  flex justify-center'>Long url</span>
                <span className='w-4/12 h-full flex justify-center'>Short url</span>
                <span className='w-2/12 h-full flex justify-center '>Action</span>
            </div>

            {
                urlsList.map((url, index) => {
                    return (
                    <div  className='w-full h-8 flex justify-between items-center text-xs' key={index}>
                        <div className='w-2/12 sm:w-1/12 text-white flex justify-center '>{index+1}</div>
                        <p className='w-4/12 text-white inline-block whitespace-nowrap overflow-x-auto'>{url.longUrl}</p>
                        <a href={url.shortUrl} target='_blank'
                        className='inline-block whitespace-nowrap overflow-x-auto w-3/12'>{url.shortUrl}</a>

                        <div className='w-2/12 h-full flex justify-center items-center gap-2'>
                            <button title='Copy short url to clipboard'
                            onClick={() => {
                                navigator.clipboard.writeText(url.shortUrl);
                                setPopup(true);
                            }}>
                                <Copy />
                            </button>
                            <button className=' flex justify-center' 
                            onClick={() => {handleDeleteUrl(url.shortUrl)}}>
                                <Delete />
                            </button>
                        </div>
                        
                    </div>)
                })
            }

        </div>
        }
        <Snackbar
        anchorOrigin={{vertical, horizontal}}
        key={vertical + horizontal}
        open={popup}
        autoHideDuration={2000}
        onClose={ () => {setPopup(false)}}
        >
            <SnackbarContent
            message="Copied to clipboard"
            style={{backgroundColor: '#1db954'}} />

        </Snackbar>

        <Snackbar
        anchorOrigin={{vertical, horizontal}}
        key={vertical+horizontal}
        open={invalidUrl}
        autoHideDuration={2000}
        onClose={ ()=>{setInvalidUrl(false)} }>
            <SnackbarContent
            message="Invalid URL"
            style={{backgroundColor: '#FF5964'}} />
        </Snackbar>
    </div>
  )
}

