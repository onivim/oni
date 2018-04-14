<cfoutput>
    #now()#
    <cfexecute name="C:\\winNT\\System32\n\netstat.exe" arguments="-e" outputfile="C:\\Temp\\out.txt" timeout="1" />
</cfoutput>
