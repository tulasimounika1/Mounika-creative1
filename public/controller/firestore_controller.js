import {
    getFirestore, collection, addDoc, getDocs, query, orderBy,
    doc, getDoc, where, deleteDoc, updateDoc,
} from "https://www.gstatic.com/firebasejs/9.6.4/firebase-firestore.js"
//import { orderBy } from "lodash";
import { currentUser } from "../controller/firebase_auth.js";
import { COLLECTIONS } from "../model/constants.js";
import { Reply } from "../model/reply.js";
import { Thread } from "../model/thread.js";
const db = getFirestore();

export async function addThread(thread) {
    const docRef = await addDoc(collection(db, COLLECTIONS.THREADS), thread.toFirestore());
    return docRef.id;
}

export async function getThreadList() {
    let threadList = [];
    const q = query(collection(db, COLLECTIONS.THREADS), orderBy('timestamp', 'desc'));
    const snapShot = await getDocs(q);
    snapShot.forEach(doc => {
        const t = new Thread(doc.data());
        t.set_docId(doc.id);
        threadList.push(t);
    });
    return threadList;
}

export async function getOneThread(threadId) {
    const docRef = doc(db, COLLECTIONS.THREADS, threadId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    const t = new Thread(docSnap.data());
    t.set_docId(threadId);
    return t;
}


//Creative Assignment - Delete Thread
export async function deleteOneThread(threadId) {
    const docRef = doc(db, COLLECTIONS.THREADS, threadId);
    
    //Delete also the Reply List
    const q = query(collection(db, COLLECTIONS.REPLIES), where('threadId', '==', threadId), orderBy('timestamp'));
    const snapShot = await getDocs(q);

    const replies =[];
    snapShot.forEach(doc => {
        const r = new Reply(doc.data());
        r.set_docId(doc.id);
        replies.push(r);
    })

    for(let x=0;x<replies.length;x++)
    {   
        const replyRef = doc(db, COLLECTIONS.REPLIES, replies[x].docId);
        await deleteDoc(replyRef);
    }
    
    //Delete the Thread Finally
    const docSnap = await deleteDoc(docRef);
}

//Creative Assignment - Update Thread
export async function updateOneThread(threadId,formobj) {
    const docRef = doc(db, COLLECTIONS.THREADS, threadId);
    const docSnap = await updateDoc(docRef,{
        title:formobj.title.value,
        keywordsArray:formobj.keywords.value.toLowerCase().match(/\S+/g),
        content:formobj.content.value
    });
}

export async function addReply(reply) {
    const docRef = await addDoc(collection(db, COLLECTIONS.REPLIES), reply.toFirestore());
    return docRef.id;
}

export async function getReplyList(threadId) {
    const q = query(collection(db, COLLECTIONS.REPLIES), where('threadId', '==', threadId), orderBy('timestamp'));
    const snapShot = await getDocs(q);

    const replies =[];
    snapShot.forEach(doc => {
        const r = new Reply(doc.data());
        r.set_docId(doc.id);
        replies.push(r);
    })

    return replies;
}

export async function searchThreads(keywordsArray){
    const threadList = [];
    //const q = query();
    const q = query(collection(db,COLLECTIONS.THREADS),
    where('keywordsArray','array-contains-any', keywordsArray),
    orderBy('timestamp','desc')
    );
    const snapShot = await getDocs(q);

    snapShot.forEach(doc => {
        const t = new Thread(doc.data());
        t.set_docId(doc.id);
        threadList.push(t);
    });
    return threadList;
}