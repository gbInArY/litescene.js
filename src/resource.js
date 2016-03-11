
/**
* This class contains all the info about a resource and it works as a template for any resource class
* Keep in mind that there are many resource classes like Meshes or Textures that dont inherit from this class.
* This class is used mainly to generic file resources like text files (scripts, csvs, etc)
*
* @class Resource
* @constructor
*/

function Resource()
{
	this.filename = null; //name of file without folder or path
	this.fullpath = null; //contains the unique name as is to be used to fetch it by the resources manager
	this.remotepath = null; //the string to fetch this resource in internet (local resources do not have this name)
	this._data = null;
}

Object.defineProperty( Resource.prototype, "data", {
	set: function(v){ 
		this._data = v;
		this._modified = true;
	},
	get: function() { 
		return this._data;
	},
	enumerable: true
});

//makes this resource available 
Resource.prototype.register = function()
{
	LS.ResourcesManager.registerResource( this.fullpath || this.filename, this );
}

Object.defineProperty( Resource.prototype, "uid", { 
	get: function(){ return this.fullpath || this.filename },
	set: function(v){},
	enumerable: true
});

/**
* Returns an object with a representation of the resource internal data
* The order to obtain that object is:
* 0. checks if getDataToStore function in resource
* 1. test for _original_file (File or Blob)
* 2. test for _original_data (ArrayBuffer)
* 3. toBinary() (ArrayBuffer)
* 4. toBlob() (Blob)
* 5. toBase64() (String)
* 6. serialize() (Object in JSON format)
* 7. data property 
* 8. JSON.stringify(...)
*
* @method Resource.getDataToStore
* @param {Object} resource 
* @return {Object} it has two fields: data and encoding
*/
Resource.getDataToStore = function( resource )
{
	var data = null;
	var encoding = "text";
	var extension = "";

	//get the data
	if (resource.getDataToStore) //function
	{
		data = resource.getDataToStore();
		if(data && data.constructor == ArrayBuffer)
			encoding = "binary";
	}
	else if (resource._original_file) //file
	{
		data = resource._original_file;
		if(data && (data.constructor !== File || data.constructor !== Blob))
			console.warn("Resource._original_file is not File or Blob");
		encoding = "file";
	}
	else if( resource._original_data ) //file in ArrayBuffer format
		data = resource._original_data;
	else if(resource.toBinary) //a function to compute the ArrayBuffer format
	{
		data = resource.toBinary();
		encoding = "binary";
		extension = "wbin";
	}
	else if(resource.toBlob) //a blob (Canvas should have this)
	{
		data = resource.toBlob();
		encoding = "file";
	}
	else if(resource.toBase64) //a base64 string
	{
		data = resource.toBase64();
		encoding = "base64";
	}
	else if(resource.serialize) //a json object
	{
		var obj = resource.serialize();
		if(obj.preview_url) //special case...
			delete obj.preview_url;
		data = JSON.stringify( obj );
	}
	else if(resource.data) //regular string data
		data = resource.data;
	else
		data = JSON.stringify( resource );

	if(data.buffer && data.buffer.constructor == ArrayBuffer)
		data = data.buffer; //store the data in the arraybuffer

	return { data:data, encoding: encoding, extension: extension };
}

//used in the coding pad to assign content to generic text files
Resource.prototype.getData = function()
{
	return this._data;
}

Resource.prototype.setData = function( v, skip_modified_flag )
{
	//remove old file
	if( this._original_data )
		this._original_data = null;
	this._data = v;
	if(!skip_modified_flag)
		this._modified = true;
}

Resource.prototype.getDataToStore = function()
{
	var data = this.data || "";
	if(data.constructor === Object )
		data = JSON.stringify( data );
	return data;
}

Resource.hasPreview = false; //should this resource use a preview image?

LS.Resource = Resource;