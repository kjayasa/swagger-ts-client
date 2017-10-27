Lambda= args:Arguments W? "=>" W? body:Body{
	return{
    	arguments:args,
        body:body
    }
}
Arguments = arg:Arg{ return [arg]} / args:ArgsList

ArgsList= "(" W? arg:Arg W? args:(ArgsSubList)* ")"{
	return [...arg,...args];
}
ArgsSubList=W? "," arg:Arg{
	return arg;
}
Arg = [_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*{
	return text()
}
Body =.+{
	return text()
}
W=[" ""\t"]*